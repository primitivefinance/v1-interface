import { useCallback, useEffect, useState } from 'react'
import { parseUnits } from '@ethersproject/units'
import { useDispatch, useSelector } from 'react-redux'
import { Currency, CurrencyAmount, Token, TokenAmount } from '@uniswap/sdk'
import uniswap from '@/lib/uniswap'
import { useWeb3React } from '@web3-react/core'
import { AppDispatch, AppState } from '../index'
import { BigNumber } from 'ethers'

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
      dispatch(typeInput({ typedValue }))
      dispatch(setLoading({ inputLoading: true }))
    },
    [dispatch]
  )
  return { onUserInput }
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string): BigNumber | undefined {
  if (!value || value === '0' || value === '.') return parseUnits('0', 18)
  const typedValueParsed = parseUnits(value, 18).toString()
  if (typedValueParsed !== '0') {
    return BigNumber.from(typedValueParsed)
  }
}
