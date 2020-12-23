import useSWR, { responseInterface } from 'swr'
import { Web3Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { Token, TokenAmount, Pair, JSBI, ChainId } from '@uniswap/sdk'

import { useWeb3React } from '@web3-react/core'
import { DataType } from './index'
import { useContract, useKeepSWRDataLiveAsBlocksArrive } from '../utils/index'
import { STABLECOIN_ADDRESS } from '../../lib/constants'
import { isAddress, getAddress } from '@ethersproject/address'

export function getReserves(
  contract: Contract,
  token0: Token,
  token1: Token
): () => Promise<Pair | null> {
  return async (): Promise<Pair | null> =>
    contract
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useReserves(
  tokenA?: Token,
  tokenB?: Token
): responseInterface<Pair | null, any> {
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
  const contract = useContract(pairAddress, IUniswapV2Pair.abi)
  const result = useSWR(
    token0 && pairAddress && contract && token1
      ? [token0.chainId, pairAddress, DataType.Reserves]
      : null,
    getReserves(contract as Contract, token0 as Token, token1 as Token)
  )
  return result
}
