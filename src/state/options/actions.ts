import { createAction } from '@reduxjs/toolkit'
import { Option, SushiSwapMarket, Venue } from '@primitivefi/sdk'
import { BigNumberish } from 'ethers'
import { ChainId } from '@sushiswap/sdk'

export interface OptionsData {
  loading: boolean
  calls: OptionsAttributes[]
  puts: OptionsAttributes[]
  reservesTotal: BigNumberish[]
}

export type OptionsAttributes = {
  entity: Option
  market: SushiSwapMarket
  asset: string
  id: string
  venue: Venue
}

export const updateOptions = createAction<OptionsData>('options/updateOptions')
export const clearOptions = createAction('options/clearOptions')
