import { useCallback, useEffect, useState } from 'react'
import { formatEther } from 'ethers/lib/utils'

import { useWeb3React } from '@web3-react/core'

import { getBalance } from '../lib/erc20'
import { BigNumberish } from 'ethers'
import { isAddress, getAddress } from '@ethersproject/address'
import { Token, Pair, TokenAmount, JSBI } from '@uniswap/sdk'
import { useContract } from '@/hooks/utils/index'
import * as IUniswapV2Pair from '@uniswap/v2-periphery/build/IUniswapV2Pair.json'
import { Contract } from 'ethers'

const usePair = (tokenA: Token, tokenB: Token) => {
  const [pair, setPair] = useState(null)
  const { account, library } = useWeb3React()

  const fetchPair = useCallback(async () => {
    const invalid = !!tokenA && !!tokenB && tokenA.equals(tokenB)
    const [token0, token1] =
      !!tokenA && !!tokenB && !invalid
        ? tokenA.sortsBefore(tokenB)
          ? [tokenA, tokenB]
          : [tokenB, tokenA]
        : []
    const pairAddress =
      !!token0 && !!token1 ? Pair.getAddress(token0, token1) : undefined
    if (!isAddress(getAddress(pairAddress))) return
    const contract = new Contract(pairAddress, IUniswapV2Pair.abi, library)
    const lpPair: Pair = contract
      .getReserves()
      .then(
        ({
          reserve0,
          reserve1,
        }: {
          reserve0: { toString: () => string }
          reserve1: { toString: () => string }
        }) => {
          const pair = new Pair(
            new TokenAmount(token0, reserve0.toString()),
            new TokenAmount(token1, reserve1.toString())
          )
          return JSBI.equal(pair.reserve0.raw, JSBI.BigInt(0)) ||
            JSBI.equal(pair.reserve1.raw, JSBI.BigInt(0))
            ? null
            : pair
        }
      )
      .catch(() => null)
    if (lpPair) {
      setPair(lpPair)
    }
  }, [account, library, tokenA, tokenB])

  useEffect(() => {
    if (account && library) {
      fetchPair()
      const refreshInterval = setInterval(fetchPair, 50000000)
      return () => clearInterval(refreshInterval)
    }
  }, [account, library, setPair, tokenA, tokenB])

  return pair
}

export default usePair
