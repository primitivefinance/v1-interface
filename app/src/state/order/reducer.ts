import { createReducer } from '@reduxjs/toolkit'
import { updateItem, removeItem, checkItem, approve } from './actions'
import { OptionsAttributes, EmptyAttributes } from '@/state/options/reducer'
import { Operation } from '@/constants/index'

export interface OrderState {
  item: OptionsAttributes
  orderType?: Operation
  loading?: boolean
  approved?: boolean
  lpApproved?: boolean
  checked?: boolean
}

export const initialState: OrderState = {
  item: EmptyAttributes,
  orderType: Operation.NONE,
  loading: false,
  approved: false,
  lpApproved: false,
  checked: false,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateItem, (state, { payload: { item, orderType, loading } }) => {
      return {
        ...state,
        item,
        orderType,
        loading,
        approved: false,
        lpApproved: false,
        checked: false,
      }
    })
    .addCase(approve, (state, { payload: { approved, lpApproved } }) => {
      return { ...state, approved, lpApproved }
    })
    .addCase(checkItem, (state, { payload: { checked } }) => {
      console.log(state.approved, state.lpApproved, checked)
      return { ...state, checked }
    })
    .addCase(removeItem, () => {
      return initialState
    })
)
