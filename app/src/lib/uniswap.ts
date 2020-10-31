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

        let orderQuantity: string = trade.inputAmount.quantity.toString()
        let amountsOut = trade.amountsOut
        let maxPremimum = trade.calcMinimumOutSlippage(
          amountsOut[1],
          tradeSettings.slippage
        )
        contract = new ethers.Contract(
          uniswapConnectorAddress,
          UniswapConnector.abi,
          trade.signer
        )
        methodName = 'openFlashLong'
        console.log(trade.option.address)
        args = [trade.option.address, orderQuantity, maxPremimum.toString()]
        value = '0'

        contractsToApprove = [uniswapConnectorAddress]
        tokensToApprove = [trade.option.assetAddresses[0]] // need to approve underlying = [0]
        break
      case Operation.SHORT:
        // Mint options then swap on Uniswap V2 in same transaction for stablecoin
        const amountIn: string = trade
          .maximumAmountIn(tradeSettings.slippage)
          .quantity.toString()
        const amountOut: string = trade
          .minimumAmountOut(tradeSettings.slippage)
          .quantity.toString()
        const deadline =
          tradeSettings.timeLimit > 0
            ? (
                Math.floor(new Date().getTime() / 1000) +
                tradeSettings.timeLimit
              ).toString()
            : tradeSettings.deadline.toString()
        const to: string = tradeSettings.receiver

        contract = new ethers.Contract(
          uniswapConnectorAddress,
          UniswapConnector.abi,
          trade.signer
        )
        methodName = 'mintLongOptionsThenSwapToTokens'
        args = [
          trade.option.address,
          amountIn,
          amountOut,
          trade.path,
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
      contractsToApprove,
      tokensToApprove,
    }
  }
}
