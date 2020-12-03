import { Operation } from '@/constants/index'
import { Trade } from './entities'
import ethers, { BigNumberish, BigNumber } from 'ethers'
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json'
import UniswapV2Router02 from '@uniswap/v2-periphery/build/UniswapV2Router02.json'
import { UNISWAP_ROUTER02_V2, UNISWAP_FACTORY_V2 } from './constants'
import UniswapConnector from '@primitivefi/v1-connectors/deployments/live/UniswapConnector03.json'
import UniswapConnectorTestnet from '@primitivefi/v1-connectors/deployments/rinkeby/UniswapConnector03.json'
import UniswapConnectorMainnet from '@primitivefi/v1-connectors/deployments/live/UniswapConnector03.json'
import { TradeSettings, SinglePositionParameters } from './types'
import { UNISWAP_CONNECTOR } from '../constants'

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
        ? UniswapConnectorMainnet.address
        : UniswapConnectorTestnet.address

    let transaction: any
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
        const orderQuantity: string = trade.inputAmount.quantity.toString()
        let premium = Trade.getPremium(
          orderQuantity,
          trade.option.optionParameters.base.quantity,
          trade.option.optionParameters.quote.quantity,
          trade.path,
          trade.reserves
        )
        premium = trade.calcMaximumInSlippage(premium, tradeSettings.slippage)
        premium = premium.gt(0) ? premium.toString() : '0'

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
        amountOut = trade.inputAmount.quantity.toString()
        amountIn = Trade.getAmountsInPure(
          amountOut,
          trade.path,
          trade.reserves[0],
          trade.reserves[1]
        )[0].toString()
        contract = new ethers.Contract(
          UNISWAP_ROUTER02_V2,
          UniswapV2Router02.abi,
          trade.signer
        )
        methodName = 'swapTokensForExactTokens'
        args = [amountOut, amountIn, trade.path, to, deadline]
        value = '0'

        contractsToApprove = [UNISWAP_ROUTER02_V2]
        tokensToApprove = [trade.option.assetAddresses[0]] // need to approve underlying = [0]
        break
      case Operation.WRITE:
        // Just purchase redeemTokens from a redeem<>underlying token pair
        amountIn = trade.inputAmount.quantity.toString()
        const amountInShort = BigNumber.from(amountIn)
          .mul(trade.option.quote.quantity)
          .div(trade.option.base.quantity)
        let minPayout = Trade.getClosePremium(
          amountInShort,
          trade.option.base.quantity,
          trade.option.quote.quantity,
          trade.path,
          trade.reserves
        )
        if (BigNumber.from(minPayout).lte(0)) {
          minPayout = '1'
        }
        contract = new ethers.Contract(
          uniswapConnectorAddress,
          UniswapConnector.abi,
          trade.signer
        )
        methodName = 'mintOptionsThenFlashCloseLong'
        args = [trade.option.address, amountIn, minPayout.toString()]
        value = '0'

        contractsToApprove = [uniswapConnectorAddress]
        tokensToApprove = [trade.option.assetAddresses[0]] // need to approve underlying = [0]
        break
      case Operation.CLOSE_LONG:
        const underlyingsRequired = trade.amountsIn[0]
        const outputUnderlyings = ethers.BigNumber.from(
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
        const amountOutMin = trade
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

        contractsToApprove = [UNISWAP_ROUTER02_V2]
        tokensToApprove = [trade.option.assetAddresses[2]] // need to approve redeem = [2]
        break
      case Operation.ADD_LIQUIDITY:
        const amountOptions = trade.inputAmount.quantity
        // amount of redeems that will be minted and added to the pool
        const amountADesired = ethers.BigNumber.from(amountOptions)
          .mul(trade.option.optionParameters.quote.quantity)
          .div(trade.option.optionParameters.base.quantity)

        let amountBDesired: BigNumberish
        if (
          BigNumber.from(trade.reserves[0]).isZero() &&
          BigNumber.from(trade.reserves[1]).isZero()
        ) {
          amountBDesired = trade.outputAmount.quantity
        } else {
          amountBDesired = trade.quote(
            amountADesired,
            trade.reserves[0],
            trade.reserves[1]
          )
        }
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
          trade.inputAmount.quantity.toString(), // make sure this isnt amountADesired, amountADesired is the quantity for the internal function
          amountBDesired.toString(),
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
        break
      case Operation.REMOVE_LIQUIDITY_CLOSE:
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
          uniswapConnectorAddress,
          UniswapConnector.abi,
          trade.signer
        )
        methodName = 'removeShortLiquidityThenCloseOptions'
        args = [
          trade.option.address,
          trade.inputAmount.quantity.toString(),
          amountAMin.toString(),
          amountBMin.toString(),
          to,
          deadline,
        ]
        value = '0'

        contractsToApprove = [uniswapConnectorAddress]
        tokensToApprove = [trade.option.address]
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
