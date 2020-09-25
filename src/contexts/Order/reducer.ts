import { OrderItem, OrderState, OrderType } from './types'
import { EmptyAttributes } from '../Options/types'

const ADD_ITEM = 'ADD_ITEM'
const REMOVE_ITEM = 'REMOVE_ITEM'
const CHANGE_ITEM = 'CHANGE_ITEM'

export interface AddItemAction {
  type: typeof ADD_ITEM
  item: OrderItem
  orderType: OrderType
}

export interface RemoveItemAction {
  type: typeof REMOVE_ITEM
  item: OrderItem
  orderType: OrderType
}

export interface ChangeItemAction {
  type: typeof CHANGE_ITEM
  item: OrderItem
  orderType: OrderType
}

export type OrderAction = AddItemAction | ChangeItemAction | RemoveItemAction

export const addItem = (
  item: OrderItem,
  orderType: OrderType
): AddItemAction => ({
  type: ADD_ITEM,
  item,
  orderType,
})

export const removeItem = (
  item: OrderItem,
  orderType: OrderType
): RemoveItemAction => ({
  type: REMOVE_ITEM,
  item,
  orderType,
})

export const changeItem = (
  item: OrderItem,
  orderType: OrderType
): ChangeItemAction => ({
  type: CHANGE_ITEM,
  item,
  orderType,
})

export const initialState = {
  item: EmptyAttributes,
  orderType: { buyOrMint: true },
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
      return {
        item: action.item,
        orderType: action.orderType,
      }
    default:
      return state
  }
}

export default reducer
