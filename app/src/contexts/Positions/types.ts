export interface PositionsContextValues {
  position: PositionsData
  getPosition: (optionAddress: string) => void
}
export interface PositionsData {
  loading: boolean
  long: string
  short: string
  LP: string
}

export type PositionsAttributes = {
  name: string
  symbol: string
  address: string
  balance: number
}

export const EmptyPositionsAttributes = {
  name: '',
  symbol: '',
  address: '',
  balance: 0,
}

export interface PositionsState {
  position: PositionsData
}
