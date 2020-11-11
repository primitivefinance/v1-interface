import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { throwError, clearError } from './actions'

export const useThrowError = (): ((msg: string, link?: string) => void) => {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (msg: string, link: string) => {
      dispatch(throwError({ msg, link }))
    },
    [dispatch]
  )
}

export const useClearError = (): (() => void) => {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(() => {
    dispatch(clearError())
  }, [dispatch])
}

export const useError = (): { msg: string; link: string } => {
  const state = useSelector<AppState, AppState['error']>((state) => state.error)
  return state
}
