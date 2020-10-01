import { createContext } from 'react'

import { PricesContextValues } from './types'

const PricesContext = createContext<PricesContextValues>({
  prices: {},
  getPrices: (asset: string) => {},
  assets: {},
})

export default PricesContext
