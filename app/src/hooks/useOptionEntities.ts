import { Web3Provider } from '@ethersproject/providers'
import { Option } from '@/lib/entities/option'
import { Protocol } from '@/lib/index'
import useSWR from 'swr'
import { DataType } from './data'

export interface OptionEntities {
  [address: string]: Option
}

const getOptionEntities = (
  chainId: number,
  provider: Web3Provider,
  optionAddresses: string[]
): (() => Promise<any>) => {
  return async (): Promise<any> => {
    return Protocol.getOptionsUsingMultiCall(chainId, optionAddresses, provider)
  }
}

const useOptionEntities = (
  chainId: number,
  provider: Web3Provider,
  optionAddresses: string[]
): any => {
  const suspense = true
  const shouldFetch = true
  const result = useSWR(
    shouldFetch ? [DataType.Option] : null,
    getOptionEntities(chainId, provider, optionAddresses),
    { suspense }
  )
  console.log(`option result: ${result.data}`)
  return result
}

export default useOptionEntities
