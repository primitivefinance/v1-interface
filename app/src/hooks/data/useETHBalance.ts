import { Web3Provider } from '@ethersproject/providers'
import { Token, TokenAmount, Pair, JSBI, ChainId } from '@uniswap/sdk'
import { useKeepSWRDataLiveAsBlocksArrive } from '../utils/index'
import { useWeb3React } from '@web3-react/core'
import useSWR, { responseInterface } from 'swr'

import { ADDRESS_ZERO } from '../../constants'
import { DataType } from './index'

function getETHBalance(
  library: Web3Provider
): (chainId: number, address: string) => Promise<TokenAmount> {
  return async (chainId: number, address: string): Promise<TokenAmount> => {
    const ETH = new Token(chainId, ADDRESS_ZERO, 18)
    return library
      .getBalance(address)
      .then(
        (balance: { toString: () => string }) =>
          new TokenAmount(ETH, balance.toString())
      )
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useETHBalance(
  address?: string | null,
  suspense = false
): responseInterface<TokenAmount, any> {
  const { chainId, library } = useWeb3React()
  const shouldFetch =
    typeof chainId === 'number' && typeof address === 'string' && !!library

  const result = useSWR(
    shouldFetch ? [chainId, address, DataType.ETHBalance] : null,
    getETHBalance(library),
    {
      suspense,
    }
  )
  useKeepSWRDataLiveAsBlocksArrive(result.mutate)
  return result
}
