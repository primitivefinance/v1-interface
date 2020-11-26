import useSWR, { responseInterface } from 'swr'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { DataType } from './index'

function getBlockNumber(library: Web3Provider): () => Promise<number> {
  return async (): Promise<number> => {
    return library.getBlockNumber()
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useBlockNumber(): responseInterface<number, any> {
  const { library } = useWeb3React()
  const shouldFetch = !!library
  return useSWR(
    shouldFetch ? [DataType.BlockNumber] : null,
    getBlockNumber(library),
    {
      refreshInterval: 10 * 500,
    }
  )
}
