import { createAction } from '@reduxjs/toolkit'
import { PositionsState } from './reducer'

export const updatePositions = createAction<PositionsState>(
  'positions/updatePositions'
)
export const setLoading = createAction('positions/setLoading')
export const clearPositions = createAction<PositionsState>(
  'positions/clearPositions'
)
