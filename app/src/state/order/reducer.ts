import { createReducer } from '@reduxjs/toolkit'
import { updateItem, removeItem } from './actions'
import { OptionsAttributes, EmptyAttributes } from '@/state/options/reducer'
import { Operation } from '@/constants/index'

export interface OrderState {
  item: OptionsAttributes
  orderType?: Operation
}

export const initialState: OrderState = {
  item: EmptyAttributes,
  orderType: Operation.NEUTRAL,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateItem, (state, { payload: { item, orderType } }) => {
      return { item, orderType }
    })
    .addCase(removeItem, (state) => {
      return initialState
    })
)
