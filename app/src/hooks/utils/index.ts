import { useEffect, useRef } from 'react'
import { responseInterface } from 'swr'
import { useBlockNumber } from '../data'

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
