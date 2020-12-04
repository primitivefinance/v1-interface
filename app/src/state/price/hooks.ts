import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from '../index'

import { updatePrice } from './actions'

export const useUpdatePrice = (): ((price: string) => void) => {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (price) => {
      dispatch(updatePrice(price))
    },
    [dispatch]
  )
}

export const usePrice = (): string => {
  const state = useSelector<AppState, AppState['price']>((state) => state.price)
  return state
}
