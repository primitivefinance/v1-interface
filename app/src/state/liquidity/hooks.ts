import { useCallback, useEffect, useState } from 'react'
import { parseUnits } from '@ethersproject/units'
import { useDispatch, useSelector } from 'react-redux'
import { Currency, CurrencyAmount, Token, TokenAmount } from '@uniswap/sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
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

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string): BigNumber | undefined {
  if (!value || value === '0' || value === '.' || value === undefined)
    return parseUnits('0', 18)
  const typedValueParsed = parseUnits(value, 18).toString()
  if (typedValueParsed !== '0') {
    return BigNumber.from(typedValueParsed)
  }
}
