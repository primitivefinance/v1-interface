import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'

import { clearInput, optionInput, underInput } from './actions'

export function useLP(): AppState['liquidity'] {
  return useSelector<AppState, AppState['liquidity']>(
    (state) => state.liquidity
  )
}
export function useClearLP() {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => {
    dispatch(clearInput())
  }, [dispatch])
}
export function useLiquidityActionHandlers(): {
  onOptionInput: (optionValue: string) => void
  onUnderInput: (underlyingValue: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onOptionInput = useCallback(
    (optionValue: string) => {
      dispatch(optionInput({ optionValue }))
    },
    [dispatch]
  )
  const onUnderInput = useCallback(
    (underlyingValue: string) => {
      dispatch(underInput({ underlyingValue }))
    },
    [dispatch]
  )
  return { onOptionInput, onUnderInput }
}
