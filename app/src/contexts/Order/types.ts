import { Web3Provider } from '@ethersproject/providers'
import { Operation } from '@/lib/constants'

export interface OrderContextValues {
  item: OrderItem
  orderType: string
  onAddItem: (item: OrderItem, orderType: string) => void
  onChangeItem: (item: OrderItem, orderType: string) => void
  onRemoveItem: (item: OrderItem) => void
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
  provideLiquidity: (
    provider: Web3Provider,
    optionAddress: string,
    min_l: number,
    max_tokens: number
  ) => Promise<void>
  withdrawLiquidity: (
    provider: Web3Provider,
    optionAddress: string,
    min_l: number,
    min_tokens: number
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
  orderType?: string
}
