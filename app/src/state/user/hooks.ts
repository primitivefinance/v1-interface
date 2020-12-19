import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from '../index'

import { updateSlippage } from './actions'

import { useLocalStorage } from '@/hooks/utils/useLocalStorage'
import { LocalStorageKeys, DEFAULT_SLIPPAGE } from '@/constants/index'
export const useSlippage = (): string => {
  const state = useSelector<AppState, AppState['user']>((state) => state.user)
  return state
}
export const useUpdateSlippage = (): ((slippage: string) => void) => {
  const dispatch = useDispatch<AppDispatch>()
  const [slip, setSlip] = useLocalStorage<string>(
    LocalStorageKeys.Slippage,
    DEFAULT_SLIPPAGE
  )
  return useCallback(
    (slippage: string) => {
      setSlip(slip)
      dispatch(updateSlippage(slippage))
    },
    [dispatch]
  )
}
