import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { typeInput, setLoading } from './actions'

export function useSwap(): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>((state) => state.swap)
}

export function useClearSwap() {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(() => {
    dispatch(typeInput({ typedValue: '' }))
  }, [dispatch])
}

export function useSetSwapLoaded(): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => {
    dispatch(setLoading({ inputLoading: false }))
  }, [dispatch])
}
export function useSwapActionHandlers(): {
  onUserInput: (typedValue: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onUserInput = useCallback(
    (typedValue: string) => {
      if (typedValue.substr(0) === '.') {
        typedValue = '0.'
      }
      dispatch(typeInput({ typedValue }))
      dispatch(setLoading({ inputLoading: true }))
    },
    [dispatch]
  )
  return { onUserInput }
}
