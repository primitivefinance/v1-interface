import {
  PositionsData,
  PositionsState,
  EmptyPositionsAttributes,
} from './types'

export const SET_POSITIONS = 'SET_POSITIONS'

export interface SetPositionsAction {
  type: typeof SET_POSITIONS
  position: PositionsData
}

export type PositionsActions = SetPositionsAction
export const initialState: PositionsState = {
  position: {
    loading: true,
    long: '',
    short: '',
    LP: '',
  },
}

export const setPositions = (
  positionsData: PositionsData
): SetPositionsAction => {
  return {
    type: SET_POSITIONS,
    position: positionsData,
  }
}

const reducer = (state: PositionsState, action: PositionsActions) => {
  switch (action.type) {
    case SET_POSITIONS:
      console.log(action)
      if (state.position.long === `` && !state.position.loading) {
        return {
          position: { ...state.position },
        }
      }
      return {
        position: {
          ...action.position,
        },
      }
    default:
  }
}

export default reducer
