import { createReducer } from '@reduxjs/toolkit'
import { updateItem, removeItem, approve } from './actions'
import { OptionsAttributes, EmptyAttributes } from '@/state/options/reducer'
import { Operation } from '@/constants/index'

export interface OrderState {
  item: OptionsAttributes
  orderType?: Operation
  loading?: boolean
  approved?: boolean
  lpApproved?: boolean
}

export const initialState: OrderState = {
  item: EmptyAttributes,
  orderType: Operation.NONE,
  loading: false,
  approved: false,
  lpApproved: false,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateItem, (state, { payload: { item, orderType, loading } }) => {
      return { ...state, item, orderType, loading }
    })
    .addCase(approve, (state, { payload: { approved, lpApproved } }) => {
      return { ...state, approved, lpApproved }
    })
    .addCase(removeItem, () => {
      return initialState
    })
)
