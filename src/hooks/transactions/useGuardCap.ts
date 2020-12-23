import { useCallback, useEffect, useState } from 'react'
import ethers, { BigNumber } from 'ethers'
import { Operation } from '../../constants'
import { useItem } from '@/state/order/hooks'
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
  const { item } = useItem()
  const getMarketDetails = () => {
    let assetName = asset.toLowerCase()
    if (assetName === 'weth') {
      assetName = 'eth'
    }
    const symbol: string = asset
    const name: string = NAME_FOR_MARKET[assetName]
    const key: string = COINGECKO_ID_FOR_MARKET[assetName]
    const address: string = ADDRESS_FOR_MARKET[assetName]
    return { name, symbol, key, address }
  }
  const { name, symbol, key, address } = getMarketDetails()
  const { data, mutate } = useSWR(
    `https://api.coingecko.com/api/v3/simple/price?ids=${key}&vs_currencies=usd&include_24hr_change=true`
  )

  useEffect(() => {
    mutate()
    if (key) {
      if (data[key]) {
        switch (orderType) {
          case Operation.ADD_LIQUIDITY:
            if (item.entity.isCall) {
              setCap((150000 / data[key].usd).toString())
            } else {
              setCap('150000')
            }
            break
          default:
            if (item.entity.isCall) {
              setCap((100000 / data[key].usd).toString())
            } else {
              setCap('100000')
            }
            break
        }
      }
    }
  }, [mutate, setCap, orderType, data])
  return ethers.utils.parseEther(cap)
}
export default useGuardCap
