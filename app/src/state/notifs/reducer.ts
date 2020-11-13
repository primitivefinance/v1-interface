import { createReducer } from '@reduxjs/toolkit'

import { addNotif, clearNotif } from './actions'

export interface Notif {
  title: string
  message: string
  link: string
}
export interface NotifState {
  [type: number]: Notif
}
export const initialState: NotifState = {}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addNotif, (state, { payload: { id, title, message, link } }) => {
      state[id] = { title, message, link }
      return state
    })
    .addCase(clearNotif, (state, { payload: id }) => {
      state[id] = null
      return state
    })
)
