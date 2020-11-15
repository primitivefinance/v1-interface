import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from '../index'
import { addNotif, clearNotif } from './actions'
import { Notif } from './reducer'

export const useAddNotif = (): ((
  id: number,
  title: string,
  msg: string,
  link: string
) => void) => {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (id, title, msg, link) => {
      dispatch(
        addNotif({
          id,
          title,
          msg,
          link,
        })
      )
    },
    [dispatch]
  )
}

export const useClearNotif = (): ((id: number) => void) => {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (id) => {
      dispatch(clearNotif(id))
    },
    [dispatch]
  )
}

export const useNotifs = (): { [id: number]: Notif } => {
  const state = useSelector<AppState, AppState['notifs']>(
    (state) => state.notifs
  )
  console.log(state)
  return state
}
