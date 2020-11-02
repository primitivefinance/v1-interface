import { BigNumberish } from 'ethers'
export interface OptionsContextValues {
  options: OptionsData
  getOptions: (assetName: string) => void
}
export interface OptionsData {
  calls: OptionsAttributes[]
  puts: OptionsAttributes[]
  reservesTotal: BigNumberish
}

export type OptionsAttributes = {
  breakEven: BigNumberish
  change: BigNumberish
  premium: BigNumberish
  strike: BigNumberish
  volume: BigNumberish
  reserve: BigNumberish
  address: string
  id: string
  expiry: BigNumberish
}

export const EmptyAttributes = {
  breakEven: 0,
  change: 0,
  premium: 0,
  strike: 0,
  volume: 0,
  reserve: 0,
  address: '',
  id: '',
  expiry: 0,
}

export interface OptionsState {
  options: OptionsData
}
