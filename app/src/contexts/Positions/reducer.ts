import { PositionsData, PositionsState, EmptyPositionAttributes } from './types'

export const SET_POSITIONS = 'SET_POSITIONS'

export interface SetPositionsAction {
  type: typeof SET_POSITIONS
  positions: PositionsData
}

export type PositionsActions = SetPositionsAction
export const initialState: PositionsState = {
  positions: {
    loading: true,
    exists: false,
    options: [EmptyPositionAttributes],
  },
}

export const setPositions = (
  positionsData: PositionsData
): SetPositionsAction => {
  return {
    type: SET_POSITIONS,
    positions: positionsData,
  }
}

const reducer = (state: PositionsState, action: PositionsActions) => {
  switch (action.type) {
    case SET_POSITIONS:
      if (state.positions.exists || !state.positions.loading) {
        return {
          positions: { ...state.positions },
        }
      }
      return {
        positions: {
          ...action.positions,
        },
      }
    default:
      return state
  }
}

export default reducer
