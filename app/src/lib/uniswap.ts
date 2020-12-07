import { Operation } from '@/constants/index'
import { Trade } from './entities'
import ethers, { BigNumberish, BigNumber } from 'ethers'
import UniswapV2Router02 from '@uniswap/v2-periphery/build/UniswapV2Router02.json'
import { UNISWAP_ROUTER02_V2 } from './constants'
import UniswapConnector from '@primitivefi/v1-connectors/deployments/live/UniswapConnector03.json'
import UniswapConnectorTestnet from '@primitivefi/v1-connectors/deployments/rinkeby/UniswapConnector03.json'
import UniswapConnectorMainnet from '@primitivefi/v1-connectors/deployments/live/UniswapConnector03.json'
import { TradeSettings, SinglePositionParameters } from './types'
import { parseEther } from 'ethers/lib/utils'
import isZero from '@/utils/isZero'

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

    let contract: ethers.Contract
    let methodName: string
    let args: (string | string[])[]
    let value: string

    let amountIn: string
    let amountOut: string
    let amountADesired: string | BigNumber
    let amountBDesired: string | BigNumber
    let amountAMin: string | BigNumber
    let amountBMin: string | BigNumber

    const deadline =
      tradeSettings.timeLimit > 0
        ? (
            Math.floor(new Date().getTime() / 1000) + tradeSettings.timeLimit
          ).toString()
        : tradeSettings.deadline.toString()
    const to: string = tradeSettings.receiver
    const baseValue: BigNumberish = trade.option.optionParameters.base.quantity
    const quoteValue: BigNumberish =
      trade.option.optionParameters.quote.quantity

    const UniswapV2Router02Contract = new ethers.Contract(
      UNISWAP_ROUTER02_V2,
      UniswapV2Router02.abi,
      trade.signer
    )

    const UniswapConnector03Contract = new ethers.Contract(
      uniswapConnectorAddress,
      UniswapConnector.abi,
      trade.signer
    )

    const inputAmount: string = trade.inputAmount.quantity.toString()

    switch (trade.operation) {
      case Operation.LONG:
        let premium = Trade.getPremium(
          inputAmount,
          baseValue,
          quoteValue,
          trade.path,
          trade.reserves
        )
        premium = trade.calcMaximumInSlippage(premium, tradeSettings.slippage)
        premium = premium.gt(0) ? premium.toString() : '0'

        contract = UniswapConnector03Contract
        methodName = 'openFlashLong'
        args = [trade.option.address, inputAmount, premium]
        value = '0'

        break
      case Operation.SHORT:
        // Just purchase redeemTokens from a redeem<>underlying token pair
        amountOut = inputAmount
        amountIn = Trade.getAmountsInPure(
          amountOut,
          trade.path,
          trade.reserves[0],
          trade.reserves[1]
        )[0].toString()
        contract = UniswapV2Router02Contract
        methodName = 'swapTokensForExactTokens'
        args = [amountOut, amountIn, trade.path, to, deadline]
        value = '0'
        break
      case Operation.WRITE:
        // Just purchase redeemTokens from a redeem<>underlying token pair
        amountIn = inputAmount
        const amountInShort = trade.option.proportionalShort(amountIn)
        let minPayout = Trade.getClosePremium(
          amountInShort,
          baseValue,
          quoteValue,
          trade.path,
          trade.reserves
        )
        if (BigNumber.from(minPayout).lte(0) || isZero(minPayout)) {
          minPayout = '1'
        }
        contract = UniswapConnector03Contract
        methodName = 'mintOptionsThenFlashCloseLong'
        args = [trade.option.address, amountIn, minPayout.toString()]
        value = '0'
        break
      case Operation.CLOSE_LONG:
        const underlyingsRequired = trade.amountsIn[0]
        const outputUnderlyings = trade.option.proportionalLong(inputAmount)
        let payout = outputUnderlyings.sub(underlyingsRequired)
        payout = trade.calcMinimumOutSlippage(payout, tradeSettings.slippage)
        payout = payout.gt(0) ? payout : BigNumber.from('1')
        contract = UniswapConnector03Contract
        methodName = 'closeFlashLong'
        args = [
          trade.option.address,
          inputAmount,
          payout.toString(), // IMPORTANT: IF THIS VALUE IS 0, IT WILL COST THE USER TO CLOSE (NEGATIVE PAYOUT)
        ]
        value = '0'
        break
      case Operation.CLOSE_SHORT:
        // Just purchase redeemTokens from a redeem<>underlying token pair
        amountIn = trade
          .maximumAmountIn(tradeSettings.slippage)
          .quantity.toString()
        const amountOutMin = trade
          .minimumAmountOut(tradeSettings.slippage)
          .quantity.toString()

        contract = UniswapV2Router02Contract
        methodName = 'swapExactTokensForTokens'
        args = [amountIn, amountOutMin, trade.path, to, deadline]
        value = '0'
        break
      case Operation.ADD_LIQUIDITY:
        const strikeRatio = trade.option.proportionalShort(parseEther('1'))
        const redeemReserves = trade.reserves[0]
        const underlyingReserves = trade.reserves[1]
        const denominator =
          isZero(redeemReserves) || isZero(underlyingReserves)
            ? 0
            : strikeRatio
                .mul(underlyingReserves.toString())
                .div(redeemReserves.toString())
                .add(parseEther('1'))
        const amountOptions = inputAmount
        const optionsInput = isZero(denominator)
          ? BigNumber.from(amountOptions)
          : BigNumber.from(amountOptions).mul(parseEther('1')).div(denominator)

        // amount of redeems that will be minted and added to the pool
        amountADesired = trade.option.proportionalShort(optionsInput)

        if (isZero(trade.reserves[0]) && isZero(trade.reserves[1])) {
          amountBDesired = trade.outputAmount.quantity.toString()
        } else {
          amountBDesired = trade
            .quote(amountADesired, trade.reserves[0], trade.reserves[1])
            .toString()
        }
        amountAMin = trade.calcMinimumOutSlippage(
          amountADesired,
          tradeSettings.slippage
        )
        amountBMin = trade.calcMinimumOutSlippage(
          amountBDesired,
          tradeSettings.slippage
        )
        contract = UniswapConnector03Contract
        methodName = 'addShortLiquidityWithUnderlying'
        args = [
          trade.option.address,
          optionsInput.toString(), // make sure this isnt amountADesired, amountADesired is the quantity for the internal function
          amountBDesired.toString(),
          amountBMin.toString(),
          to,
          deadline,
        ]
        value = '0'
        break
      case Operation.ADD_LIQUIDITY_CUSTOM:
        // amount of redeems that will be minted and added to the pool
        amountADesired = trade.option.proportionalShort(inputAmount)
        amountBDesired = trade.outputAmount.quantity.toString()

        amountAMin = trade.calcMinimumOutSlippage(
          amountADesired,
          tradeSettings.slippage
        )
        amountBMin = trade.calcMinimumOutSlippage(
          amountBDesired,
          tradeSettings.slippage
        )
        contract = UniswapV2Router02Contract
        methodName = 'addLiquidity'
        args = [
          trade.path[0],
          trade.path[1],
          inputAmount,
          trade.outputAmount.quantity.toString(),
          amountAMin.toString(),
          amountBMin.toString(),
          to,
          deadline,
        ]
        value = '0'
        break
      case Operation.REMOVE_LIQUIDITY:
        amountAMin = isZero(trade.totalSupply)
          ? BigNumber.from('0')
          : BigNumber.from(inputAmount)
              .mul(trade.reserves[0])
              .div(trade.totalSupply)
        amountBMin = isZero(trade.totalSupply)
          ? BigNumber.from('0')
          : BigNumber.from(inputAmount)
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
        contract = UniswapV2Router02Contract
        methodName = 'removeLiquidity'
        args = [
          trade.path[0],
          trade.path[1],
          inputAmount,
          trade.outputAmount.quantity.toString(),
          amountAMin.toString(),
          amountBMin.toString(),
          to,
          deadline,
        ]
        value = '0'
        break
      case Operation.REMOVE_LIQUIDITY_CLOSE:
        amountAMin = isZero(trade.totalSupply)
          ? BigNumber.from('0')
          : BigNumber.from(inputAmount)
              .mul(trade.reserves[0])
              .div(trade.totalSupply)
        amountBMin = isZero(trade.totalSupply)
          ? BigNumber.from('0')
          : BigNumber.from(inputAmount)
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
        contract = UniswapConnector03Contract
        methodName = 'removeShortLiquidityThenCloseOptions'
        args = [
          trade.option.address,
          inputAmount,
          amountAMin.toString(),
          amountBMin.toString(),
          to,
          deadline,
        ]
        value = '0'
        break
    }

    return {
      contract,
      methodName,
      args,
      value,
    }
  }
}
