import { createContext } from 'react'
import { EmptyAttributes } from '../Options/types'
import { OrderContextValues, OrderItem, NewOptionItem } from './types'
import { Operation } from '@/lib/constants'
import { Web3Provider } from '@ethersproject/providers'

const OrderContext = createContext<OrderContextValues>({
  item: EmptyAttributes,
  orderType: '',
  onAddItem: (item: OrderItem | NewOptionItem, orderType: string) => {},
  onChangeItem: (item: OrderItem, orderType: string) => {},
  onRemoveItem: (item: OrderItem | NewOptionItem) => {},
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
  provideLiquidity: async (
    provider: Web3Provider,
    optionAddress: string,
    min_l: number,
    max_tokens: number
  ) => {},
  withdrawLiquidity: async (
    provider: Web3Provider,
    optionAddress: string,
    min_l: number,
    min_tokens: number
  ) => {},
})

export default OrderContext
