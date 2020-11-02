import { createContext } from 'react'
import { EmptyAttributes } from '../Options/types'
import { OrderContextValues, OrderItem, NewOptionItem } from './types'
import { Operation } from '@/lib/constants'
import { Web3Provider } from '@ethersproject/providers'

const OrderContext = createContext<OrderContextValues>({
  item: EmptyAttributes,
  orderType: '',
  onAddItem: (item: OrderItem | NewOptionItem, orderType: string) => {},
  onChangeItem: (item: OrderItem | NewOptionItem, orderType: string) => {},
  onRemoveItem: (item: OrderItem | NewOptionItem) => {},
  submitOrder: async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number,
    operation: Operation
  ) => {},
})

export default OrderContext
