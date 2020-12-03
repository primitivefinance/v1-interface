import { createReducer } from '@reduxjs/toolkit'
import { updateItem, removeItem } from './actions'
import { OptionsAttributes, EmptyAttributes } from '@/state/options/reducer'
import { Operation } from '@/constants/index'

export interface OrderState {
  item: OptionsAttributes
  orderType?: Operation
  loading?: boolean
  approved?: boolean[]
}

export const initialState: OrderState = {
  item: EmptyAttributes,
  orderType: Operation.NONE,
  loading: false,
  approved: [false, false],
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(
      updateItem,
      (state, { payload: { item, orderType, loading, approved } }) => {
        return {
          ...state,
          item,
          orderType,
          loading,
          approved,
        }
      }
    )
    .addCase(removeItem, () => {
      return initialState
    })
)
