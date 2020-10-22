import { Direction } from './constants'
import { Trade } from './entities'

export interface TradeSettings {
  slippage: string
  timeLimit: number
  receiver: string
  deadline: number
}

export interface SinglePositionParameters {
  contractName: string
  methodName: string
  args: (string | string[])[]
  value: string
}

/**
 * Represents the UniswapConnector contract.
 */
export class UniswapConnector {
  private constructor() {}

  public static singlePositionCallParameters(
    trade: Trade,
    tradeSettings: TradeSettings
  ): SinglePositionParameters {
    let contractName: string
    let methodName: string
    let args: (string | string[])[]
    let value: string

    let amountIn: string = trade.inputAmount.quantity.toString()
    let amountOut: string = trade.inputAmount.quantity.toString()
    let path: string[] = ['0x', trade.option.address]
    let deadline =
      tradeSettings.timeLimit > 0
        ? (
            Math.floor(new Date().getTime() / 1000) + tradeSettings.timeLimit
          ).toString()
        : tradeSettings.deadline.toString()
    let to: string = tradeSettings.receiver

    /* let parameters = trade.option.optionParameters

    const isWethCall = parameters.base.asset.symbol === 'ETHER'
    const isWethPut = parameters.quote.asset.symbol === 'ETHER'
    const isWethOption = isWethCall || isWethPut */

    switch (trade.direction) {
      case Direction.LONG:
        // Standard swap from stablecoin to option through the Uniswap V2 Router.
        contractName = 'UniswapV2Router02'
        methodName = 'swapExactTokensForTokens'
        args = [amountIn, amountOut, path, to, deadline]
        value = '0'
        break
      case Direction.SHORT:
        // Mint options then swap on Uniswap V2 in same transaction.
        contractName = 'UniswapConnector'
        methodName = 'mintOptionsThenSwapToTokens'
        args = [trade.option.address, amountIn, amountOut, path, to, deadline]
        value = '0'
        break
    }

    return {
      contractName,
      methodName,
      args,
      value,
    }
  }
}
