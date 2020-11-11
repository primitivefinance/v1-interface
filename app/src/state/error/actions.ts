import { createAction } from '@reduxjs/toolkit'

export const throwError = createAction<{
  msg: string
  link?: string
}>('error/throwError')

export const clearError = createAction('error/clearError')
