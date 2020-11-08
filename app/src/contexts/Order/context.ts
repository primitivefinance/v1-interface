import { createContext } from 'react'
import { EmptyAttributes } from '../Options/types'
import { OrderContextValues } from './types'
import { OptionsAttributes } from '@/contexts/Options/types'
import { Operation } from '@/lib/constants'
import { Web3Provider } from '@ethersproject/providers'

const OrderContext = createContext<OrderContextValues>({
  item: EmptyAttributes,
  orderType: Operation.NEUTRAL,
  onAddItem: (item: OptionsAttributes, orderType: Operation) => {},
  onChangeItem: (item: OptionsAttributes, orderType: Operation) => {},
  onRemoveItem: (item: OptionsAttributes) => {},
  submitOrder: async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number,
    operation: Operation,
    secondaryQuantity?: number
  ) => {},
})

export default OrderContext
