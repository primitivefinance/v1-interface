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
  strike: number
  volume: number
  longReserve: number
  shortReserve: number
  address: string
  id: string
  expiry: number
  isActive: boolean
}

export const EmptyAttributes = {
  breakEven: 0,
  change: 0,
  price: 0,
  strike: 0,
  volume: 0,
  longReserve: 0,
  shortReserve: 0,
  address: '',
  id: '',
  expiry: 0,
  isActive: false,
}

export interface OptionsState {
  options: OptionsData
}
