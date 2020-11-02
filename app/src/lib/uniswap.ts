import { STABLECOIN_ADDRESS, Operation } from './constants'
import { Trade } from './entities'
import ethers from 'ethers'
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json'
import UniswapV2Router02 from '@uniswap/v2-periphery/build/UniswapV2Router02.json'
import { UNISWAP_ROUTER02_V2, UNISWAP_FACTORY_V2 } from './constants'
import UniswapConnector from '@primitivefi/contracts/artifacts/UniswapConnector03.json'
import UniswapConnectorTestnet from '@primitivefi/contracts/deployments/rinkeby/UniswapConnector03.json'
//import UniswapConnectorMainnet from '@primitivefi/contracts/deployments/live_1/UniswapConnector03.json'

export interface TradeSettings {
  slippage: string
  timeLimit: number
  receiver: string
  deadline: number
  stablecoin?: string
}

export interface SinglePositionParameters {
  contract: ethers.Contract
  methodName: string
  args: string[]
  value: string
  contractsToApprove?: string[]
  tokensToApprove?: string[]
}

/**
 * Represents the UniswapConnector contract.
 */
export class Uniswap {
  private constructor() {}

  public static singlePositionCallParameters(
    trade: Trade,
    tradeSettings: TradeSettings
  ): SinglePositionParameters {
    const uniswapConnectorAddress =
      trade.option.chainId === 1
        ? UniswapConnectorTestnet.address
        : UniswapConnectorTestnet.address

    let contract: ethers.Contract
    let methodName: string
    let args: (string | string[])[]
    let value: string

    let contractsToApprove: string[]
    let tokensToApprove: string[]

    let amountIn: string
    let amountOut: string
    let amountAMin: string | ethers.BigNumber
    let amountBMin: string | ethers.BigNumber
    const deadline =
      tradeSettings.timeLimit > 0
        ? (
            Math.floor(new Date().getTime() / 1000) + tradeSettings.timeLimit
          ).toString()
        : tradeSettings.deadline.toString()
    const to: string = tradeSettings.receiver

    switch (trade.operation) {
      case Operation.LONG:
        let orderQuantity: string = trade.inputAmount.quantity.toString()
        let premium = trade.getPremium(
          orderQuantity,
          trade.option.optionParameters.base.quantity,
          trade.option.optionParameters.quote.quantity,
          trade.path,
          trade.reserves
        )
        premium = trade.calcMaximumInSlippage(premium, tradeSettings.slippage)
        premium = premium > 0 ? premium : '0'

        contract = new ethers.Contract(
          uniswapConnectorAddress,
          UniswapConnector.abi,
          trade.signer
        )
        methodName = 'openFlashLong'
        args = [trade.option.address, orderQuantity, premium]
        value = '0'

        contractsToApprove = [uniswapConnectorAddress]
        tokensToApprove = [trade.option.assetAddresses[0]] // need to approve underlying = [0]
        break
      case Operation.SHORT:
        // Just purchase redeemTokens from a redeem<>underlying token pair
        amountIn = trade
          .maximumAmountIn(tradeSettings.slippage)
          .quantity.toString()
        amountOut = trade
          .minimumAmountOut(tradeSettings.slippage)
          .quantity.toString()
        contract = new ethers.Contract(
          UNISWAP_ROUTER02_V2,
          UniswapV2Router02.abi,
          trade.signer
        )
        methodName = 'swapTokensForExactTokens'
        args = [amountOut, amountIn, trade.path, to, deadline]
        value = '0'

        contractsToApprove = [uniswapConnectorAddress]
        tokensToApprove = [trade.option.assetAddresses[0]] // need to approve underlying = [0]
        break
      case Operation.CLOSE_LONG:
        let underlyingsRequired = trade.amountsIn[0]
        let outputUnderlyings = ethers.BigNumber.from(
          trade.inputAmount.quantity
        )
          .mul(trade.option.optionParameters.base.quantity)
          .div(trade.option.optionParameters.quote.quantity)
        let payout = outputUnderlyings.sub(underlyingsRequired)
        payout = trade.calcMinimumOutSlippage(payout, tradeSettings.slippage)
        payout = payout.gt(0) ? payout : ethers.BigNumber.from('1')
        contract = new ethers.Contract(
          uniswapConnectorAddress,
          UniswapConnector.abi,
          trade.signer
        )
        methodName = 'closeFlashLong'
        args = [
          trade.option.address,
          trade.inputAmount.quantity.toString(),
          payout.toString(), // IMPORTANT: IF THIS VALUE IS 0, IT WILL COST THE USER TO CLOSE (NEGATIVE PAYOUT)
        ]
        value = '0'

        contractsToApprove = [uniswapConnectorAddress]
        tokensToApprove = payout.gt(0) //if payout is negative, need to approve underlying
          ? [trade.option.address]
          : [trade.option.address, trade.option.assetAddresses[0]] // need to approve underlying = [0]
        break
      case Operation.CLOSE_SHORT:
        // Just purchase redeemTokens from a redeem<>underlying token pair
        amountIn = trade
          .maximumAmountIn(tradeSettings.slippage)
          .quantity.toString()
        let amountOutMin = trade
          .minimumAmountOut(tradeSettings.slippage)
          .quantity.toString()

        contract = new ethers.Contract(
          UNISWAP_ROUTER02_V2,
          UniswapV2Router02.abi,
          trade.signer
        )
        methodName = 'swapExactTokensForTokens'
        args = [amountIn, amountOutMin, trade.path, to, deadline]
        value = '0'

        contractsToApprove = [uniswapConnectorAddress]
        tokensToApprove = [trade.option.assetAddresses[2]] // need to approve redeem = [2]
        break
      case Operation.ADD_LIQUIDITY:
        let amountOptions = trade.inputAmount.quantity
        // amount of redeems that will be minted and added to the pool
        let amountADesired = ethers.BigNumber.from(amountOptions)
          .mul(trade.option.optionParameters.quote.quantity)
          .div(trade.option.optionParameters.base.quantity)
        let amountBDesired = trade.quote(
          amountADesired,
          trade.reserves[0],
          trade.reserves[1]
        )
        amountAMin = trade.calcMinimumOutSlippage(
          amountADesired,
          tradeSettings.slippage
        )
        amountBMin = trade.calcMinimumOutSlippage(
          amountBDesired,
          tradeSettings.slippage
        )
        contract = new ethers.Contract(
          uniswapConnectorAddress,
          UniswapConnector.abi,
          trade.signer
        )
        methodName = 'addShortLiquidityWithUnderlying'
        args = [
          trade.option.address,
          trade.option.assetAddresses[0],
          trade.inputAmount.quantity.toString(), // make sure this isnt amountADesired, amountADesired is the quantity for the internal function
          amountBDesired.toString(),
          amountAMin.toString(),
          amountBMin.toString(),
          to,
          deadline,
        ]
        value = '0'

        contractsToApprove = [uniswapConnectorAddress]
        tokensToApprove = [trade.option.assetAddresses[0]] // need to approve underlying = [0]
        break
      case Operation.REMOVE_LIQUIDITY:
        amountAMin = ethers.BigNumber.from(trade.inputAmount.quantity)
          .mul(trade.reserves[0])
          .div(trade.totalSupply)
        amountBMin = ethers.BigNumber.from(trade.inputAmount.quantity)
          .mul(trade.reserves[1])
          .div(trade.totalSupply)

        amountAMin = trade.calcMinimumOutSlippage(
          amountAMin.toString(),
          tradeSettings.slippage
        )
        amountBMin = trade.calcMinimumOutSlippage(
          amountBMin.toString(),
          tradeSettings.slippage
        )
        contract = new ethers.Contract(
          UNISWAP_ROUTER02_V2,
          UniswapV2Router02.abi,
          trade.signer
        )
        methodName = 'removeLiquidity'
        args = [
          trade.path[0],
          trade.path[1],
          trade.inputAmount.quantity.toString(),
          amountAMin.toString(),
          amountBMin.toString(),
          to,
          deadline,
        ]
        value = '0'

        contractsToApprove = [uniswapConnectorAddress]
        tokensToApprove = [trade.option.assetAddresses[0]] // need to approve underlying = [0]
        break
    }

    return {
      contract,
      methodName,
      args,
      value,
      contractsToApprove,
      tokensToApprove,
    }
  }
}
