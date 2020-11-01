import { STABLECOIN_ADDRESS, Operation } from './constants'
import { Trade } from './entities'
import ethers from 'ethers'
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json'
import UniswapV2Router02 from '@uniswap/v2-periphery/build/UniswapV2Router02.json'
import { UNISWAP_ROUTER02_V2, UNISWAP_FACTORY_V2 } from './constants'
import UniswapConnector from '@primitivefi/contracts/artifacts/UniswapConnector03.json'
import UniswapConnectorTestnet from '@primitivefi/contracts/deployments/rinkeby/UniswapConnector03.json'
//import UniswapConnectorMainnet from '@primitivefi/contracts/deployments/live_1/UniswapConnector03.json'

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
        let orderQuantity: string = trade.inputAmount.quantity.toString()
        let premium = trade.getPremium(
          orderQuantity,
          trade.option.optionParameters.base.quantity,
          trade.option.optionParameters.quote.quantity,
          trade.path,
          trade.reserves
        )
        premium = trade.calcMaximumInSlippage(premium, tradeSettings.slippage)
        premium = premium > 0 ? premium : '0'

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
        console.log('short')
        let underlyingsRequired = trade.amountsIn[0]
        let outputUnderlyings = ethers.BigNumber.from(
          trade.inputAmount.quantity
        )
          .mul(trade.option.optionParameters.base.quantity)
          .div(trade.option.optionParameters.quote.quantity)
        let payout = outputUnderlyings.sub(underlyingsRequired)
        payout = trade.calcMinimumOutSlippage(payout, tradeSettings.slippage)
        payout = payout.gt(0) ? payout : ethers.BigNumber.from('1')
        console.log(`payout ${payout.toString()}`)
        contract = new ethers.Contract(
          uniswapConnectorAddress,
          UniswapConnector.abi,
          trade.signer
        )
        methodName = 'closeFlashLong'
        args = [
          trade.option.address,
          trade.inputAmount.quantity.toString(),
          '0', //payout.toString(),
        ]
        value = '0'

        contractsToApprove = [uniswapConnectorAddress]
        tokensToApprove = payout.gt(0) //if payout is negative, need to approve underlying
          ? [trade.option.address]
          : [trade.option.address, trade.option.assetAddresses[0]] // need to approve underlying = [0]
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
