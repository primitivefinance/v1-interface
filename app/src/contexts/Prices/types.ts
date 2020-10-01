export interface PricesContextValues {
  prices: PricesData
  getPrices: (asset: string) => void
  assets: AssetsData
}
export interface PricesData {
  [key: string]: number
}

export interface AssetsData {
  [key: string]: Object
}

export interface PricesState {
  prices: PricesData
  assets: AssetsData
}
