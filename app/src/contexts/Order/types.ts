import { Web3Provider } from '@ethersproject/providers'
import { Operation } from '@/lib/constants'

export interface OrderContextValues {
  item: OrderItem
  orderType: OrderType
  onAddItem: (item: OrderItem, orderType: OrderType) => void
  onChangeItem: (item: OrderItem, orderType: OrderType) => void
  submitOrder: (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number,
    operation: Operation
  ) => Promise<void>
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
