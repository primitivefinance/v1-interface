import { Web3Provider } from '@ethersproject/providers'
import { BigNumberish } from 'ethers'
import { Operation } from '@/constants/index'

export interface OrderContextValues {
  item: OrderItem
  orderType: Operation
  onAddItem: (item: OrderItem, orderType: string) => void
  onChangeItem: (item: OrderItem, orderType: string) => void
  onRemoveItem: (item: OrderItem) => void
  submitOrder: (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number,
    operation: Operation,
    secondaryQuantity?: number
  ) => Promise<void>
}

export interface OrderItem {
  asset?: string
  isCall?: boolean
  underlyingAddress?: string
  price?: BigNumberish
  address?: string
  pairAddress?: string
  breakEven?: BigNumberish
  change?: BigNumberish
  expiry?: BigNumberish
  premium?: BigNumberish
  reserve?: BigNumberish
  strike?: BigNumberish
  volume?: BigNumberish
  id?: string
}

export interface OrderState {
  item: OrderItem
  orderType?: string
}
