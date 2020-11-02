import { BigNumberish } from 'ethers'
export interface OptionsContextValues {
  options: OptionsData
  getOptions: (assetName: string) => void
}
export interface OptionsData {
  calls: OptionsAttributes[]
  puts: OptionsAttributes[]
  reservesTotal: number
}

export type OptionsAttributes = {
  breakEven: number
  change: number
  price: number
  strike: BigNumberish
  volume: number
  reserve: number
  address: string
  id: string
  expiry: number
}

export const EmptyAttributes = {
  breakEven: 0,
  change: 0,
  price: 0,
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
