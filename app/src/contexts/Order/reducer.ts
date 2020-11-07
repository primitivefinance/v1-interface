import { OrderState } from './types'
import { EmptyAttributes } from '../Options/types'
import { Operation } from '@/constants/index'
import { OptionsAttributes } from '@/contexts/Options/types'

const ADD_ITEM = 'ADD_ITEM'
const REMOVE_ITEM = 'REMOVE_ITEM'
const CHANGE_ITEM = 'CHANGE_ITEM'

export interface AddItemAction {
  type: typeof ADD_ITEM
  item: OptionsAttributes
  orderType: Operation
}
export interface RemoveItemAction {
  type: typeof REMOVE_ITEM
  item: OptionsAttributes
}

export interface ChangeItemAction {
  type: typeof CHANGE_ITEM
  item: OptionsAttributes
  orderType: Operation
}

export type OrderAction = AddItemAction | ChangeItemAction | RemoveItemAction

export const addItem = (
  item: OptionsAttributes,
  orderType: Operation
): AddItemAction => ({
  type: ADD_ITEM,
  item,
  orderType,
})

export const removeItem = (item: OptionsAttributes): RemoveItemAction => ({
  type: REMOVE_ITEM,
  item,
})

export const changeItem = (
  item: OptionsAttributes,
  orderType: Operation
): ChangeItemAction => ({
  type: CHANGE_ITEM,
  item,
  orderType,
})

export const initialState = {
  item: EmptyAttributes,
  orderType: Operation.NONE,
}

const reducer = (state: OrderState = initialState, action: OrderAction) => {
  switch (action.type) {
    case ADD_ITEM:
      return {
        item: action.item,
        orderType: action.orderType,
      }
    case CHANGE_ITEM:
      return {
        item: action.item,
        orderType: action.orderType,
      }
    case REMOVE_ITEM:
      return initialState
    default:
      return state
  }
}

export default reducer
