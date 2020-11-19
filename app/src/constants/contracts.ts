import UniswapConnector from '@primitivefi/v1-connectors/deployments/live/UniswapConnector03.json'
import OptionFactory from '@primitivefi/contracts/deployments/live_1/OptionFactory.json'
import RedeemFactory from '@primitivefi/contracts/deployments/live_1/RedeemFactory.json'
import Registry from '@primitivefi/contracts/deployments/live_1/Registry.json'
import Trader from '@primitivefi/contracts/deployments/live_1/Trader.json'

export interface ContractMetaData {
  address: string
  name: string
  receipt: any
  audit: string
  id: string
}

export const NAME_FOR_CONTRACT: { [key: string]: string } = {
  option: 'Option',
  redeem: 'Redeem',
  trader: 'Trader',
  registry: 'Registry',
  optionFactory: 'OptionFactory',
  redeemFactory: 'RedeemFactory',
  uniswapConnector: 'UniswapConnector',
}

export const ADDRESS_FOR_CONTRACT: { [key: string]: string } = {
  option: '0x6aE525044dF6da91D37Dd8378BaBD30790918cC8',
  redeem: '0xD28F3bd39E411390857FA53fcC4dAa2890445f21',
  trader: Trader.address,
  registry: Registry.address,
  optionFactory: OptionFactory.address,
  redeemFactory: RedeemFactory.address,
  uniswapConnector: UniswapConnector.address,
}

export const RECEIPT_FOR_CONTRACT: { [key: string]: Object } = {
  option: {},
  trader: Trader.receipt,
  registry: Registry.receipt,
  optionFactory: OptionFactory.receipt,
  redeemFactory: RedeemFactory.receipt,
  uniswapConnector: UniswapConnector.receipt,
}

export const AUDIT_FOR_CONTRACT: { [key: string]: string } = {
  option: 'https://blog.openzeppelin.com/primitive-audit/',
  redeem: 'https://blog.openzeppelin.com/primitive-audit/',
  trader: 'https://blog.openzeppelin.com/primitive-audit/',
  registry: 'N/A',
  optionFactory: 'N/A',
  redeemFactory: 'N/A',
  uniswapConnector: 'N/A',
}

export const CONTRACTS: ContractMetaData[] = Object.keys(NAME_FOR_CONTRACT).map(
  (key): ContractMetaData => {
    return {
      name: NAME_FOR_CONTRACT[key],
      address: ADDRESS_FOR_CONTRACT[key],
      receipt: RECEIPT_FOR_CONTRACT[key],
      audit: AUDIT_FOR_CONTRACT[key],
      id: key,
    }
  }
)
