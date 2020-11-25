import { createReducer } from '@reduxjs/toolkit'
import { updateItem, removeItem } from './actions'
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
    .addCase(
      updateItem,
      (
        state,
        { payload: { item, orderType, loading, approved, lpApproved } }
      ) => {
        console.log(approved)
        return {
          ...state,
          item,
          orderType,
          loading,
          approved,
          lpApproved,
        }
      }
    )
    .addCase(removeItem, () => {
      return initialState
    })
)
