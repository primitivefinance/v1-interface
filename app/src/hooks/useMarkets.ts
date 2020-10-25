import { useContext } from 'react'
import { Context as MarketsContext } from '../contexts/Markets-dep'

const useMarkets = () => {
  const markets = useContext(MarketsContext)
  return [markets]
}

export default useMarkets
