import ethers from 'ethers'
import { Operation } from '@/constants/index'
import { Trade } from './entities'
import TraderArtifact from '@primitivefi/contracts/artifacts/Trader.json'
import MainnetTrader from '@primitivefi/contracts/deployments/live_1/Trader.json'
import TestnetTrader from '@primitivefi/contracts/deployments/rinkeby/Trader.json'
import WethConnectorArtifact from '@primitivefi/contracts/artifacts/WethConnector01.json'
//import MainnetWethConnector from '@primitivefi/contracts/deployments/live_1/WethConnector01.json'
import TestnetWethConnector from '@primitivefi/contracts/deployments/rinkeby/WethConnector01.json'
import { TradeSettings, SinglePositionParameters } from './types'

/**
 * Represents the Primitive V1 Trader contract.
 */
export class Trader {
  private constructor() {}

  public static singleOperationCallParameters(
    trade: Trade,
    tradeSettings: TradeSettings
  ): SinglePositionParameters {
    const traderAddress =
      trade.option.chainId == 1 ? MainnetTrader.address : TestnetTrader.address
    const wethConnectorAddress =
      trade.option.chainId == 1
        ? TestnetWethConnector.address // fix when mainnet is deployed
        : TestnetWethConnector.address
    let contract = new ethers.Contract(
      traderAddress,
      TraderArtifact.abi,
      trade.signer
    )
    let methodName: string
    let args: (string | string[])[]
    let value: string

    const optionAddress: string = trade.option.address
    const amountIn: string = trade.inputAmount.raw.toString()
    const to: string = tradeSettings.receiver

    const parameters = trade.option.optionParameters
    const isWethCall = parameters.base.token.symbol === 'ETHER'
    const isWethPut = parameters.quote.token.symbol === 'ETHER'

    switch (trade.operation) {
      case Operation.MINT:
        // Mint options through the Trader Library (inherited by Trader and WethConnectorArtifact).

        if (isWethCall) {
          contract = new ethers.Contract(
            wethConnectorAddress,
            WethConnectorArtifact.abi,
            trade.signer
          )
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
        // Exercise options through the Trader Library (inherited by Trader and WethConnectorArtifact).

        if (isWethPut) {
          contract = new ethers.Contract(
            wethConnectorAddress,
            WethConnectorArtifact.abi,
            trade.signer
          )
          methodName = 'safeExerciseWithETH'
          args = [optionAddress, to]
          value = amountIn
        } else if (isWethCall) {
          contract = new ethers.Contract(
            wethConnectorAddress,
            WethConnectorArtifact.abi,
            trade.signer
          )
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
        // Exercise options through the Trader Library (inherited by Trader and WethConnectorArtifact).

        if (isWethCall) {
          contract = new ethers.Contract(
            wethConnectorAddress,
            WethConnectorArtifact.abi,
            trade.signer
          )
          methodName = 'safeRedeemForETH'
        } else {
          methodName = 'safeRedeem'
        }
        args = [optionAddress, amountIn, to]
        value = '0'
        break
      case Operation.CLOSE:
        // Exercise options through the Trader Library (inherited by Trader and WethConnectorArtifact).

        if (isWethCall) {
          contract = new ethers.Contract(
            wethConnectorAddress,
            WethConnectorArtifact.abi,
            trade.signer
          )
          methodName = 'safeCloseForETH'
        } else {
          methodName = 'safeClose'
        }
        args = [optionAddress, amountIn, to]
        value = '0'
        break
      case Operation.UNWIND:
        // Exercise options through the Trader Library (inherited by Trader and WethConnectorArtifact).

        if (isWethCall) {
          contract = new ethers.Contract(
            wethConnectorAddress,
            WethConnectorArtifact.abi,
            trade.signer
          )
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
