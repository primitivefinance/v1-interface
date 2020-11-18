import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { addNotif, clearNotif, resetNotif } from './actions'
import { Notif } from './reducer'
import { useWeb3React } from '@web3-react/core'

export const useAddNotif = (): ((
  id: number,
  title: string,
  msg: string,
  link: string
) => void) => {
  const dispatch = useDispatch<AppDispatch>()
  const { active } = useWeb3React()

  return useCallback(
    (id, title, msg, link) => {
      if (active) {
        dispatch(
          addNotif({
            id,
            title,
            msg,
            link,
          })
        )
      }
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

export const useResetNotif = (): (() => void) => {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(() => {
    dispatch(resetNotif())
  }, [dispatch])
}
export const useNotifs = (): { [id: number]: Notif } => {
  const state = useSelector<AppState, AppState['notifs']>(
    (state) => state.notifs
  )
  return state
}
