import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../index'
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
