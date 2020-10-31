import { STABLECOIN_ADDRESS, Operation } from './constants'
import { Trade } from './entities'
import ethers from 'ethers'
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json'
import UniswapV2Router02 from '@uniswap/v2-periphery/build/UniswapV2Router02.json'
import { UNISWAP_ROUTER02_V2, UNISWAP_FACTORY_V2 } from './constants'
import UniswapConnector from '@primitivefi/contracts/artifacts/UniswapConnector02.json'
import UniswapConnectorTestnet from '@primitivefi/contracts/deployments/rinkeby/UniswapConnector02.json'
//import UniswapConnectorMainnet from '@primitivefi/contracts/deployments/live_1/UniswapConnector02.json'

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
    let amountIn: string = trade
      .maximumAmountIn(tradeSettings.slippage)
      .quantity.toString()
    let amountOut: string = trade
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
        let factory = new ethers.Contract(
          UNISWAP_FACTORY_V2,
          UniswapV2Factory.abi,
          trade.signer
        )
        /* "optionAddress": "0x05b8dAD398d12d2bd36e1a38e97c3692e7fAFcec",
    "redeemAddress": "0x2d069584c648B953D1589dB3396ACE52b2826426",
    "underlyingAddress": "0xc45c339313533a6c9B05184CD8B5486BC53F75Fb",
    "pairAddress": "0x3269931d3108603ba63BDD401Fd6e3E0C6b90eb7"
         */
        let tradePath = [
          '0x2d069584c648B953D1589dB3396ACE52b2826426', // redeem
          '0xc45c339313533a6c9B05184CD8B5486BC53F75Fb', // underlying
        ]
        let amounts = trade
          .getAmountsOut(trade.signer, factory, amountIn, tradePath)
          .then((amounts) => {
            return amounts
          })
        let amountOut = amounts[1]
        contract = new ethers.Contract(
          uniswapConnectorAddress,
          UniswapConnector.abi,
          trade.signer
        )
        methodName = 'openFlashLong'
        console.log(trade.option.address)
        args = ['0x05b8dAD398d12d2bd36e1a38e97c3692e7fAFcec', '1000000', '0']
        value = '0'
        break
      case Operation.SHORT:
        // Mint options then swap on Uniswap V2 in same transaction for stablecoin
        path = [
          trade.option.address,
          tradeSettings.stablecoin || STABLECOIN_ADDRESS,
        ]
        contract = new ethers.Contract(
          uniswapConnectorAddress,
          UniswapConnector.abi,
          trade.signer
        )
        methodName = 'mintLongOptionsThenSwapToTokens'
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
