import { createContext } from 'react'
import { EmptyAttributes } from '../Options/types'
import { OrderContextValues, OrderItem } from './types'
import { Operation } from '@/lib/constants'
import { Web3Provider } from '@ethersproject/providers'

const OrderContext = createContext<OrderContextValues>({
  item: EmptyAttributes,
  orderType: '',
  onAddItem: (item: OrderItem, orderType: string) => {},
  onChangeItem: (item: OrderItem, orderType: string) => {},
  onRemoveItem: (item: OrderItem) => {},
  submitOrder: async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number,
    operation: Operation,
    secondaryQuantity?: number
  ) => {},
})

export default OrderContext
