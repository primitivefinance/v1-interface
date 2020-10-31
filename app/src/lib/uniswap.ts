import { STABLECOIN_ADDRESS, Operation } from './constants'
import { Trade } from './entities'
import ethers from 'ethers'
import UniswapTrader from '@primitivefi/contracts/artifacts/UniswapConnector02.json'
import UniswapV2Router02 from '@uniswap/v2-periphery/build/UniswapV2Router02.json'
import { UNISWAP_ROUTER02_V2 } from './constants'
import UniswapTraderMainnet from '@primitivefi/contracts/deployments/rinkeby/UniswapTrader.json'

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
  args: (string | string[])[]
  value: string
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
    let contract: ethers.Contract
    let methodName: string
    let args: (string | string[])[]
    let value: string
    console.log('stops')
    const amountIn: string = trade
      .maximumAmountIn(tradeSettings.slippage)
      .quantity.toString()
    const amountOut: string = trade
      .minimumAmountOut(tradeSettings.slippage)
      .quantity.toString()
    let path: string[] = [
      tradeSettings.stablecoin || STABLECOIN_ADDRESS,
      trade.option.address,
    ]
    const deadline =
      tradeSettings.timeLimit > 0
        ? (
            Math.floor(new Date().getTime() / 1000) + tradeSettings.timeLimit
          ).toString()
        : tradeSettings.deadline.toString()
    const to: string = tradeSettings.receiver

    switch (trade.operation) {
      case Operation.LONG:
        // Standard swap from stablecoin to option through the Uniswap V2 Router.
        contract = new ethers.Contract(
          UNISWAP_ROUTER02_V2,
          UniswapV2Router02.abi,
          trade.signer
        )
        methodName = 'swapTokensForExactTokens'
        args = [amountOut, amountIn, path, to, deadline]
        value = '0'
        break
      case Operation.SHORT:
        // Mint options then swap on Uniswap V2 in same transaction for stablecoin
        path = [
          trade.option.address,
          tradeSettings.stablecoin || STABLECOIN_ADDRESS,
        ]
        contract = new ethers.Contract(
          UniswapTraderMainnet.address,
          UniswapTrader.abi,
          trade.signer
        )
        methodName = 'mintOptionsThenSwapToTokens'
        args = [trade.option.address, amountIn, amountOut, path, to, deadline]
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
