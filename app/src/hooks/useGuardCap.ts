import { useCallback, useEffect, useState } from 'react'
import ethers, { BigNumber } from 'ethers'
import { Operation } from '../constants'
import {
  COINGECKO_ID_FOR_MARKET,
  NAME_FOR_MARKET,
  ADDRESS_FOR_MARKET,
  ETHERSCAN_MAINNET,
  ETHERSCAN_RINKEBY,
  getIconForMarket,
} from '@/constants/index'
import useSWR from 'swr'

const useGuardCap = (asset: string, orderType: Operation): BigNumber => {
  const [cap, setCap] = useState('0.00')

  const getMarketDetails = () => {
    const symbol: string = asset
    const name: string = NAME_FOR_MARKET[asset.toLowerCase()]
    const key: string = COINGECKO_ID_FOR_MARKET[asset.toLowerCase()]
    const address: string = ADDRESS_FOR_MARKET[asset.toLowerCase()]
    return { name, symbol, key, address }
  }
  const { name, symbol, key, address } = getMarketDetails()
  const { data, mutate } = useSWR(
    `https://api.coingecko.com/api/v3/simple/price?ids=${key}&vs_currencies=usd&include_24hr_change=true`
  )

  useEffect(() => {
    mutate()
    console.log(data)
    if (data[key]) {
      switch (orderType) {
        case Operation.ADD_LIQUIDITY:
          setCap((15000 / data[key].usd).toString())
          break
        default:
          setCap((10000 / data[key].usd).toString())
          break
      }
    }
  }, [mutate, setCap, orderType, data])
  console.log(ethers.utils.parseEther(cap).toString())
  return ethers.utils.parseEther(cap)
}
export default useGuardCap
