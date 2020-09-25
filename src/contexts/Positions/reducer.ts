import {
  PositionsData,
  PositionsState,
  EmptyPositionsAttributes,
} from './types'

export const SET_POSITIONS = 'SET_POSITIONS'

export interface SetPositionsAction {
  type: typeof SET_POSITIONS
  positions: PositionsData
}

export type PositionsActions = SetPositionsAction
export const initialState: PositionsState = {
  positions: {
    calls: [EmptyPositionsAttributes],
    puts: [EmptyPositionsAttributes],
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
      return {
        ...state,
        positions: {
          ...state.positions,
          ...action.positions,
        },
      }
    default:
      return state
  }
}

export default reducer
