import { Option } from '@/lib/entities'
import { BigNumberish } from 'ethers'
export interface OptionsContextValues {
  options: OptionsData
  getOptions: (assetName: string) => void
}
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
  strike: BigNumberish
  volume: BigNumberish
  reserves: BigNumberish[]
  reserve: BigNumberish
  depth: number
  address: string
  id: string
  expiry: BigNumberish
}

export const EmptyAttributes = {
  entity: null,
  asset: '',
  breakEven: 0,
  change: 0,
  premium: 0,
  strike: 0,
  volume: 0,
  reserves: [0, 0],
  reserve: 0,
  depth: 0,
  address: '',
  id: '',
  expiry: 0,
}

export interface OptionsState {
  options: OptionsData
}
