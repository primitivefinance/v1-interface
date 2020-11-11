import { useMemo } from 'react'
import { QueryParameters } from '../../constants'
import { useRouter } from 'next/router'
import { getAddress } from '@ethersproject/address'
import { injected } from '../../connectors'

const chainMappings: { [key: string]: number } = {
  '1': 1,
  mainnet: 1,
  '3': 3,
  ropsten: 3,
  '4': 4,
  rinkeby: 4,
  '5': 5,
  görli: 5,
  goerli: 5,
  '42': 42,
  kovan: 42,
}

export function useQueryParameters(): {
  [QueryParameters.CHAIN]: number | undefined
  [QueryParameters.INPUT]: string | undefined
  [QueryParameters.OUTPUT]: string | undefined
} {
  const { query } = useRouter()

  let candidateChainId: number | undefined
  try {
    candidateChainId = chainMappings[query[QueryParameters.CHAIN] as string]
  } catch {
    console.error('chain mapping failed')
  }
  const chainId =
    !!injected.supportedChainIds &&
    typeof candidateChainId === 'number' &&
    injected.supportedChainIds.includes(candidateChainId)
      ? candidateChainId
      : undefined

  let input: string | undefined
  try {
    if (typeof query[QueryParameters.INPUT] === 'string')
      input = getAddress(query[QueryParameters.INPUT] as string)
  } catch {
    console.error('input error')
  }

  let output: string | undefined
  try {
    if (typeof query[QueryParameters.OUTPUT] === 'string')
      output = getAddress(query[QueryParameters.OUTPUT] as string)
  } catch {
    console.error('output error')
  }

  return useMemo(
    () => ({
      [QueryParameters.CHAIN]: chainId,
      [QueryParameters.INPUT]: input,
      [QueryParameters.OUTPUT]: output,
    }),
    [chainId, input, output]
  )
}
