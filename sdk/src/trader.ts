import { Trade } from './entities'

export interface TradeSettings {
  slippage: string
  deadline: string
  receiver: string
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

  public static singlePositionCallParameters(
    trade: Trade,
    tradeSettings: TradeSettings
  ): SinglePositionParameters {
    let contractName: string
    let methodName: string
    let args: (string | string[])[]
    let value: string

    return {
      contractName,
      methodName,
      args,
      value,
    }
  }
}
