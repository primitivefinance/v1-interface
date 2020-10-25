import { createContext } from 'react'
import { EmptyAttributes } from '../Options/types'
import { OrderContextValues, OrderItem, OrderType } from './types'
import { Operation } from '@/lib/constants'
import { Web3Provider } from '@ethersproject/providers'

const OrderContext = createContext<OrderContextValues>({
  item: EmptyAttributes,
  orderType: { buyOrMint: true },
  onAddItem: (item: OrderItem, orderType: OrderType) => {},
  onChangeItem: (item: OrderItem, orderType: OrderType) => {},
  submitOrder: async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number,
    operation: Operation
  ) => {},
  createOption: async (
    provider: Web3Provider,
    asset: string,
    isCallType: boolean,
    expiry: string,
    strike: number
  ) => {},
  mintTestTokens: async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => {},
})

export default OrderContext
