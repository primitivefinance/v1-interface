import { Option } from '@/lib/entities/option'
import { BigNumberish } from 'ethers'
import { OptionsAttributes } from '../Options/types'

export interface PositionsContextValues {
  positions: PositionsData
  getPositions: (options: OptionsAttributes[]) => void
}
// lets add a stablecoin position value attribute later...
export interface PositionsData {
  loading: boolean
  exists: boolean
  options: OptionPosition[]
}

export type PositionsAttributes = {
  name: string
  symbol: string
  address: string
  balance: number
}

export type OptionPosition = {
  entity: Option
  asset: string
  strike: BigNumberish
  address: string
  long: BigNumberish
  redeem: BigNumberish
  lp: BigNumberish
}

export const EmptyPositionAttributes = {
  entity: null,
  asset: '',
  strike: 0,
  address: '',
  long: 0,
  redeem: 0,
  lp: 0,
}

export interface PositionsState {
  positions: PositionsData
}
