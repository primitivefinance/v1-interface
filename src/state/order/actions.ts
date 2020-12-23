import { createAction } from '@reduxjs/toolkit'
import { OrderState } from './reducer'

export const updateItem = createAction<OrderState>('order/updateItem')
export const removeItem = createAction('order/removeItem')
