import { createReducer } from '@reduxjs/toolkit'
import { updateItem, removeItem } from './actions'
import { OptionsAttributes, EmptyAttributes } from '@/state/options/reducer'
import { Operation } from '@/constants/index'

export interface OrderState {
  item: OptionsAttributes
  orderType?: Operation
  loading?: boolean
}

export const initialState: OrderState = {
  item: EmptyAttributes,
  orderType: Operation.NEUTRAL,
  loading: false,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateItem, (state, { payload: { item, orderType, loading } }) => {
      return { ...state, item, orderType, loading }
    })
    .addCase(removeItem, () => {
      return initialState
    })
)
