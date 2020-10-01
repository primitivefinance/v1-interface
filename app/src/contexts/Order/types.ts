import { Web3Provider } from '@ethersproject/providers'

export interface OrderContextValues {
  item: OrderItem
  orderType: OrderType
  onAddItem: (item: OrderItem, orderType: OrderType) => void
  onChangeItem: (item: OrderItem, orderType: OrderType) => void
  buyOptions: (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => Promise<void>
  sellOptions: (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => Promise<void>
  mintOptions: (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => Promise<void>
  exerciseOptions: (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => Promise<void>
  redeemOptions: (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => Promise<void>
  closeOptions: (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => Promise<void>
  loadPendingTx: () => void
  createOption: (
    provider: Web3Provider,
    asset: string,
    isCallType: boolean,
    expiry: string,
    strike: number
  ) => Promise<void>
  mintTestTokens: (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => Promise<void>
}

export interface OrderItem {
  breakEven: number
  change: number
  price: number
  strike: number
  volume: number
  address: string
  id: string
  expiry: number
}

export interface OrderState {
  item: OrderItem
  orderType: OrderType
}

export interface OrderType {
  buyOrMint: boolean
}
