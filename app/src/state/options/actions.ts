import { createAction } from '@reduxjs/toolkit'
import { Option } from '@/lib/entities'
import { BigNumberish } from 'ethers'
import { ChainId } from '@uniswap/sdk'

export interface OptionsData {
  loading: boolean
  calls: OptionsAttributes[]
  puts: OptionsAttributes[]
  reservesTotal: BigNumberish
}

export type OptionsAttributes = {
  entity: Option
  asset: string
  breakEven: BigNumberish
  change: BigNumberish
  premium: BigNumberish
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

export const updateOptions = createAction<OptionsData>('options/updateOptions')
