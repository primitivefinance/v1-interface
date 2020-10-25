import { createContext } from 'react'

import { OrderContextValues, OrderItem } from './types'
import { EmptyAttributes } from '../Options/types'
import { Web3Provider } from '@ethersproject/providers'

const OrderContext = createContext<OrderContextValues>({
  item: EmptyAttributes,
  orderType: 'BUY',
  onAddItem: (item: OrderItem, orderType: string) => {},
  onChangeItem: (item: OrderItem, orderType: string) => {},
  onRemoveItem: (item: OrderItem) => {},
  buyOptions: async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => {},
  sellOptions: async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => {},
  mintOptions: async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => {},
  exerciseOptions: async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => {},
  redeemOptions: async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => {},
  closeOptions: async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
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
