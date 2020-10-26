import { useEffect, useRef, useMemo } from 'react'
import { Web3Provider } from '@ethersproject/providers'

import { responseInterface } from 'swr'
import { Contract, ContractInterface } from '@ethersproject/contracts'
import { useBlockNumber } from '../data'
import { useWeb3React } from '@web3-react/core'

export { usePrevious } from './usePrevious'
export { useLocalStorage } from './useLocalStorage'
export { useClickAway } from './useClickAway'
export { useQueryParameters } from './useQueryParameters'

export function useKeepSWRDataLiveAsBlocksArrive(
  mutate: responseInterface<any, any>['mutate']
): void {
  // because we don't care about the referential identity of mutate, just bind it to a ref
  const mutateRef = useRef(mutate)
  useEffect(() => {
    mutateRef.current = mutate
  })
  // then, whenever a new block arrives, trigger a mutation
  const { data } = useBlockNumber()
  useEffect(() => {
    mutateRef.current()
  }, [data])
}

export function useContract(
  library: Web3Provider,
  account: string,
  address?: string,

  ABI?: ContractInterface,
  withSigner = false
): Contract | undefined {
  let result = undefined
  !!address && !!ABI && !!library
    ? (result = new Contract(
        address,
        ABI,
        withSigner ? library.getSigner(account).connectUnchecked() : library
      ))
    : null
  return result
}
