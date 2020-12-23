import { createAction } from '@reduxjs/toolkit'

export const updatePrice = createAction<string>('price/updatePrice')
