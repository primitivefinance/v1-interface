import { useContext } from 'react'

import { PricesContext } from '../contexts/Prices-dep'

const usePrices = () => {
  return useContext(PricesContext)
}

export default usePrices
