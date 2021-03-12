import { createAction } from '@reduxjs/toolkit'

export const typeInput = createAction<{ typedValue: string }>('swap/typeInput')
export const setLoading = createAction<{ inputLoading: boolean }>(
  'swap/setLoading'
)
export const setReduce = createAction<{ reduce: boolean }>('swap/setReduce')
