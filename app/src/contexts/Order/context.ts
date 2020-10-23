import { createContext } from 'react'

import { OrderContextValues, OrderItem, OrderType } from './types'
import { EmptyAttributes } from '../Options/types'
import { Web3Provider } from '@ethersproject/providers'

const OrderContext = createContext<OrderContextValues>({
  item: EmptyAttributes,
  orderType: { buyOrMint: true },
  onAddItem: (item: OrderItem, orderType: OrderType) => {},
  onChangeItem: (item: OrderItem, orderType: OrderType) => {},
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
})

export default OrderContext
