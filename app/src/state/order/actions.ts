import { createAction } from '@reduxjs/toolkit'
import { OrderState } from './reducer'

export const updateItem = createAction<any>('order/updateItem')
export const updateItemLoading = createAction<any>('order/updateItemLoading')
export const approve = createAction<any>('order/approve')
export const checkItem = createAction<any>('order/checkItem')
export const removeItem = createAction('order/removeItem')
