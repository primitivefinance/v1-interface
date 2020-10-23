export interface PositionsContextValues {
  positions: PositionsData
  getPositions: (assetName: string, options: any) => void
}
export interface PositionsData {
  calls: PositionsAttributes[]
  puts: PositionsAttributes[]
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
  positions: PositionsData
}
