import { createAction } from '@reduxjs/toolkit'

export const optionInput = createAction<{
  optionValue: string
}>('liquidity/optionInput')
export const underInput = createAction<{
  underlyingValue: string
}>('liquidity/underInput')
export const clearInput = createAction('liquidity/clearInput')
