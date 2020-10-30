import ethers from 'ethers'
import { Operation } from './constants'
import { Trade } from './entities'
import TraderArtifact from '@primitivefi/contracts/artifacts/Trader.json'
import WethConnector from '@primitivefi/contracts/artifacts/WethConnector'

export interface TradeSettings {
  slippage: string
  timeLimit: number
  receiver: string
  deadline: number
}

export interface SinglePositionParameters {
  contract: ethers.Contract
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
    let contract = new ethers.Contract('', TraderArtifact.abi, trade.signer)
    let methodName: string
    let args: (string | string[])[]
    let value: string

    const optionAddress: string = trade.option.address
    const amountIn: string = trade.inputAmount.quantity.toString()
    const to: string = tradeSettings.receiver

    const parameters = trade.option.optionParameters
    const isWethCall = parameters.base.asset.symbol === 'ETHER'
    const isWethPut = parameters.quote.asset.symbol === 'ETHER'

    switch (trade.operation) {
      case Operation.MINT:
        // Mint options through the Trader Library (inherited by Trader and WethConnector).

        if (isWethCall) {
          //fix - publish primitive contracts contract = 'WethConnector'
          methodName = 'safeMintWithETH'
          args = [optionAddress, to]
          value = amountIn
        } else {
          methodName = 'safeMint'
          args = [optionAddress, amountIn, to]
          value = '0'
        }
        break
      case Operation.EXERCISE:
        // Exercise options through the Trader Library (inherited by Trader and WethConnector).

        if (isWethPut) {
          //fix - publish primitive contracts contract = 'WethConnector'
          methodName = 'safeExerciseWithETH'
          args = [optionAddress, to]
          value = amountIn
        } else if (isWethCall) {
          //fix - publish primitive contracts contract = 'WethConnector'
          methodName = 'safeExerciseForETH'
          args = [optionAddress, amountIn, to]
          value = '0'
        } else {
          methodName = 'safeExercise'
          args = [optionAddress, amountIn, to]
          value = '0'
        }
        break
      case Operation.REDEEM:
        // Exercise options through the Trader Library (inherited by Trader and WethConnector).

        if (isWethCall) {
          //fix - publish primitive contracts contract = 'WethConnector'
          methodName = 'safeRedeemForETH'
        } else {
          methodName = 'safeRedeem'
        }
        args = [optionAddress, amountIn, to]
        value = '0'
        break
      case Operation.CLOSE:
        // Exercise options through the Trader Library (inherited by Trader and WethConnector).

        if (isWethCall) {
          //fix - publish primitive contracts contract = 'WethConnector'
          methodName = 'safeCloseForETH'
        } else {
          methodName = 'safeClose'
        }
        args = [optionAddress, amountIn, to]
        value = '0'
        break
      case Operation.UNWIND:
        // Exercise options through the Trader Library (inherited by Trader and WethConnector).

        if (isWethCall) {
          //fix - publish primitive contracts contract = 'WethConnector'
          methodName = 'safeUnwindForETH'
        } else {
          methodName = 'safeUnwind'
        }
        args = [optionAddress, amountIn, to]
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
