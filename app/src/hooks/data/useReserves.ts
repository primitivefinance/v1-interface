import useSWR, { responseInterface } from 'swr'
import { Web3Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'

import { Token, TokenAmount, Pair, JSBI, ChainId } from '@uniswap/sdk'

import { useWeb3React } from '@web3-react/core'
import { DataType } from './index'
import { useContract, useKeepSWRDataLiveAsBlocksArrive } from '../utils/index'
import { STABLECOIN_ADDRESS } from '../../lib/constants'

function getReserves(
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
  tokenA?: Token
): responseInterface<Pair | null, any> {
  const { chainId } = useWeb3React()
  const tokenB = new Token(chainId, STABLECOIN_ADDRESS, 18, 'DAI')

  const invalid = !!tokenA && !!tokenB && tokenA.equals(tokenB)
  const [token0, token1] =
    !!tokenA && !!tokenB && !invalid
      ? tokenA.sortsBefore(tokenB)
        ? [tokenA, tokenB]
        : [tokenB, tokenA]
      : []
  const pairAddress =
    !!token0 && !!token1 ? Pair.getAddress(token0, token1) : undefined
  const contract = useContract(pairAddress, IUniswapV2Pair.abi)
  const result = useSWR(
    token0 && pairAddress && contract && token1
      ? [token0.chainId, pairAddress, DataType.Reserves]
      : null,
    getReserves(contract as Contract, token0 as Token, token1 as Token)
  )
  useKeepSWRDataLiveAsBlocksArrive(result.mutate)
  return result
}
