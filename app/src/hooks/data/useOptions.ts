import { useCallback, useEffect, useState } from 'react'
import useSWR, { responseInterface } from 'swr'
import ethers, { BigNumberish, BigNumber } from 'ethers'
import {
  Pair,
  Token,
  TokenAmount,
  /* Trade,  */ TradeType,
  ChainId,
  Route,
} from '@uniswap/sdk'

import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { DataType } from './index'
import { Trade, Option } from '@/lib/entities'
import { Protocol } from '@/lib/protocol'
import { STABLECOINS } from '@/constants/index'

export interface OptionsData {
  calls: OptionsAttributes[]
  puts: OptionsAttributes[]
  reservesTotal: BigNumberish
}
export type OptionsAttributes = {
  asset: string
  breakEven: BigNumberish
  change: BigNumberish
  premium: BigNumberish
  strike: BigNumberish
  volume: BigNumberish
  reserve: BigNumberish
  address: string
  pairAddress?: string
  expiry: BigNumberish
  id: string
}
export const EmptyAttributes = {
  asset: '',
  breakEven: 0,
  change: 0,
  premium: 0,
  strike: 0,
  volume: 0,
  reserve: 0,
  address: '',
  pairAddress: '',
  expiry: 0,
  id: '',
}

/**
 * @dev Calculates the breakeven asset premium depending on if the option is a call or put.
 * @param strike The strike premium of the option.
 * @param premium The current premium of the option.
 * @param isCall If the option is a call, if not a call, its a put.
 */
const calculateBreakeven = (
  strike: BigNumberish,
  premium: BigNumberish,
  isCall: boolean
): BigNumberish => {
  let breakeven
  if (isCall) {
    breakeven = BigNumber.from(premium).add(strike)
  } else {
    breakeven = BigNumber.from(strike).sub(premium)
  }
  return Number(breakeven)
}

/**
 * @dev Gets the execution premium for 1 unit of option tokens and returns it.
 * @param option The address of the option token to get a uniswap pair of.
 */
const getPairData = async (provider, option: Option, chainId: ChainId) => {
  const optionAddress = option.address
  const parameters = option.optionParameters
  const base = parameters.base.quantity
  const quote = parameters.quote.quantity
  let premium: BigNumberish = 0

  // Check to make sure we are connected to a web3 provider.
  if (!provider) {
    console.error('No connected connectedProvider')
    return { premium }
  }
  const chain = chainId

  const OPTION = new Token(chain, optionAddress, 18)
  const UNDERLYING = STABLECOINS[chainId]
  const tokenA = UNDERLYING
  const tokenB = OPTION
  try {
    const address = Pair.getAddress(tokenA, tokenB)
    const [reserves0, reserves1] = await new ethers.Contract(
      address,
      IUniswapV2Pair.abi,
      provider
    ).getReserves()
    const path = [option.assetAddresses[2], option.assetAddresses[0]] // 0 = underlying, 1 = strike ,2 = redeem
    premium = Trade.getSpotPremium(base, quote, path, [reserves0, reserves1])
    const balances = tokenA.sortsBefore(tokenB)
      ? [reserves0, reserves1]
      : [reserves1, reserves0]
    const pair = new Pair(
      new TokenAmount(tokenA, balances[0]),
      new TokenAmount(tokenB, balances[1])
    )

    let reserve =
      Number(pair.reserve1.numerator) / Number(pair.reserve1.denominator)

    if (typeof reserve === 'undefined') {
      reserve = 0
    }

    if (typeof premium === 'undefined') {
      premium = 0
    }

    return { premium, reserve }
  } catch {
    const premium = 0
    const reserve = 0
    return { premium, reserve }
  }

function getOptions(
  library: Web3Provider,
  chainId: ChainId,
  assetName: string
): () => Promise<OptionsData> {
  return async (): Promise<OptionsData> => {
    return grabOptions
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useOptions(
  library,
  chainId,
  assetName: string,
  suspense = false
): responseInterface<OptionsData, any> {
  const [symbol, setSym] = useState(assetName)
  const [options, setOptions] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (symbol === 'eth') {
      setSym('WETH')
    } else {
      setSym(assetName.toUpperCase())
    }
  }, [setSym])

  useEffect(() => {
    if (library) {
      getOptions(library, chainId, symbol)
    }
  }, [library, chainId, symbol])

  return useSWR(getOptions(library, chainId, assetName), {
    refreshInterval: 100 * 1000,
  })
}
