import { OptionsData, OptionsState, EmptyAttributes } from './types'

export const SET_OPTIONS = 'SET_OPTIONS'
export interface SetOptionsAction {
  type: typeof SET_OPTIONS
  options: OptionsData
}

export type OptionsActions = SetOptionsAction
export const initialState: OptionsState = {
  options: {
    calls: [EmptyAttributes],
    puts: [EmptyAttributes],
    loading: true,
    reservesTotal: 0,
  },
}

export const setOptions = (optionsData: OptionsData): SetOptionsAction => {
  return {
    type: SET_OPTIONS,
    options: optionsData,
  }
}

const reducer = (state: OptionsState, action: OptionsActions) => {
  switch (action.type) {
    case SET_OPTIONS:
      return {
        options: {
          ...action.options,
        },
      }
    default:
      return state
  }
}

export default reducer
