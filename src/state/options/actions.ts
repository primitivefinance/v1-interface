import { createAction } from '@reduxjs/toolkit'
import { Option, Market } from '@primitivefi/sdk'
import { BigNumberish } from 'ethers'
import { ChainId } from '@uniswap/sdk'

export interface OptionsData {
  loading: boolean
  calls: OptionsAttributes[]
  puts: OptionsAttributes[]
  reservesTotal: BigNumberish[]
}

export type OptionsAttributes = {
  entity: Option
  market: Market
  asset: string
  id: string
}

export const updateOptions = createAction<OptionsData>('options/updateOptions')
export const clearOptions = createAction<OptionsData>('options/clearOptions')
