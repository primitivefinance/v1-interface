import { createAction } from '@reduxjs/toolkit'

export const typeInput = createAction<{ typedValue: string }>('swap/typeInput')
