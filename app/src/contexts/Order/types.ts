import { Web3Provider } from '@ethersproject/providers'
import { Operation } from '@/lib/constants'
import { BigNumberish } from 'ethers'

export interface OrderContextValues {
  item: OrderItem | NewOptionItem
  orderType: string
  onAddItem: (item: OrderItem | NewOptionItem, orderType: string) => void
  onChangeItem: (item: OrderItem | NewOptionItem, orderType: string) => void
  onRemoveItem: (item: OrderItem | NewOptionItem) => void
  submitOrder: (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number,
    operation: Operation
  ) => Promise<void>
}

export interface OrderItem {
  asset?: string
  price?: BigNumberish
  address: string
  breakEven?: BigNumberish
  change?: BigNumberish
  expiry?: BigNumberish
  premium?: BigNumberish
  strike?: BigNumberish
  volume?: BigNumberish
  id?: string
}

export interface NewOptionItem {
  asset?: string
  address: string
  price?: BigNumberish
  breakEven?: BigNumberish
  change?: BigNumberish
  expiry: BigNumberish
  premium?: BigNumberish
  strike?: BigNumberish
  volume?: BigNumberish
  id?: string
}
export interface OrderState {
  item: OrderItem
  orderType?: string
}
