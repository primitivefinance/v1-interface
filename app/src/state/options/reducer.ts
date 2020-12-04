import { createReducer } from '@reduxjs/toolkit'

import { updateOptions } from './actions'

import { Option } from '@/lib/entities'
import { BigNumberish } from 'ethers'

export type OptionsAttributes = {
  entity: Option
  asset: string
  breakEven: BigNumberish
  change: BigNumberish
  premium: BigNumberish
  closePremium: BigNumberish
  shortPremium: BigNumberish
  strike: BigNumberish
  volume: BigNumberish
  reserves: BigNumberish[]
  token0: string
  token1: string
  depth: BigNumberish
  address: string
  id: string
  expiry: BigNumberish
}

export interface OptionsState {
  loading: boolean
  calls: OptionsAttributes[]
  puts: OptionsAttributes[]
  reservesTotal: BigNumberish[]
}

export const EmptyAttributes = {
  entity: null,
  asset: '',
  breakEven: 0,
  change: 0,
  premium: 0,
  closePremium: 0,
  shortPremium: 0,
  strike: 0,
  volume: 0,
  reserves: [0, 0],
  token0: '',
  token1: '',
  depth: 0,
  address: '',
  id: '',
  expiry: 0,
}

export const initialState: OptionsState = {
  loading: true,
  calls: [EmptyAttributes],
  puts: [EmptyAttributes],
  reservesTotal: [0, 0],
}

export default createReducer(initialState, (builder) =>
  builder.addCase(
    updateOptions,
    (state, { payload: { loading, calls, puts, reservesTotal } }) => {
      return { ...state, loading, calls, puts, reservesTotal }
    }
  )
)
