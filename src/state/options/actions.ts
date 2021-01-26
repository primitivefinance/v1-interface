import { createAction } from '@reduxjs/toolkit'
import { Option, UniswapMarket, SushiSwapMarket, Venue } from '@primitivefi/sdk'
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
  market: UniswapMarket | SushiSwapMarket
  asset: string
  id: string
  venue: Venue
}

export const updateOptions = createAction<OptionsData>('options/updateOptions')
export const clearOptions = createAction<OptionsData>('options/clearOptions')
