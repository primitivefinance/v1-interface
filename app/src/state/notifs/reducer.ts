import { createReducer } from '@reduxjs/toolkit'
import { LOCATION_CHANGE } from 'react-redux'
import { addNotif, clearNotif, resetNotif } from './actions'

export interface Notif {
  title: string
  msg: string
  link: string
}
export interface NotifState {
  [type: number]: Notif
}
export const initialState: NotifState = {}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addNotif, (state, { payload: { id, title, msg, link } }) => {
      state[id] = { title, msg, link }
      return state
    })
    .addCase(clearNotif, (state, { payload: id }) => {
      state[id] = null
      return state
    })
    .addCase(resetNotif, (state) => {
      state = {}
      return state
    })
)
