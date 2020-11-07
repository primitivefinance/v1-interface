import { Web3Provider } from '@ethersproject/providers'
import { BigNumberish } from 'ethers'
import { Operation } from '@/constants/index'
import { OptionsAttributes } from '@/contexts/Options/types'

export interface OrderContextValues {
  item: OptionsAttributes
  orderType: Operation
  onAddItem: (item: OptionsAttributes, orderType: Operation) => void
  onChangeItem: (item: OptionsAttributes, orderType: Operation) => void
  onRemoveItem: (item: OptionsAttributes) => void
  submitOrder: (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number,
    operation: Operation,
    secondaryQuantity?: number
  ) => Promise<void>
}

/* export interface OptionsAttributes {
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
} */

export interface OrderState {
  item: OptionsAttributes
  orderType?: Operation
}
