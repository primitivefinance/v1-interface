import { Direction, Operation } from './constants'
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
 * Represents the Primitive V1 Trader contract.
 */
export class Trader {
  private constructor() {}

  public static singleOperationCallParameters(
    trade: Trade,
    tradeSettings: TradeSettings
  ): SinglePositionParameters {
    let contractName = 'Trader'
    let methodName: string
    let args: (string | string[])[]
    let value: string

    const option: string = trade.option.address
    const amountIn: string = trade.inputAmount.quantity.toString()
    const to: string = tradeSettings.receiver

    const parameters = trade.option.optionParameters
    const isWethCall = parameters.base.asset.symbol === 'ETHER'
    const isWethPut = parameters.quote.asset.symbol === 'ETHER'

    switch (trade.operation) {
      case Operation.MINT:
        // Mint options through the Trader Library (inherited by Trader and WethConnector).

        if (isWethCall) {
          contractName = 'WethConnector'
          methodName = 'safeMintWithETH'
          args = [option, to]
          value = amountIn
        } else {
          methodName = 'safeMint'
          args = [option, amountIn, to]
          value = '0'
        }
        break
      case Operation.EXERCISE:
        // Exercise options through the Trader Library (inherited by Trader and WethConnector).

        if (isWethPut) {
          contractName = 'WethConnector'
          methodName = 'safeExerciseWithETH'
          args = [option, to]
          value = amountIn
        } else if (isWethCall) {
          contractName = 'WethConnector'
          methodName = 'safeExerciseForETH'
          args = [option, amountIn, to]
          value = '0'
        } else {
          methodName = 'safeExercise'
          args = [option, amountIn, to]
          value = '0'
        }
        break
      case Operation.REDEEM:
        // Exercise options through the Trader Library (inherited by Trader and WethConnector).

        if (isWethCall) {
          contractName = 'WethConnector'
          methodName = 'safeRedeemForETH'
        } else {
          methodName = 'safeRedeem'
        }
        args = [option, amountIn, to]
        value = '0'
        break
      case Operation.CLOSE:
        // Exercise options through the Trader Library (inherited by Trader and WethConnector).

        if (isWethCall) {
          contractName = 'WethConnector'
          methodName = 'safeCloseForETH'
        } else {
          methodName = 'safeClose'
        }
        args = [option, amountIn, to]
        value = '0'
        break
      case Operation.UNWIND:
        // Exercise options through the Trader Library (inherited by Trader and WethConnector).

        if (isWethCall) {
          contractName = 'WethConnector'
          methodName = 'safeUnwindForETH'
        } else {
          methodName = 'safeUnwind'
        }
        args = [option, amountIn, to]
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
