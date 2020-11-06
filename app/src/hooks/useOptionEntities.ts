import { Web3Provider } from '@ethersproject/providers'
import { Option } from '@/lib/entities/option'
import { Protocol } from '@/lib/index'

export interface OptionEntities {
  [address: string]: Option
}

const useOptionEntities = async (
  chainId: number,
  provider: Web3Provider,
  optionAddresses: string[]
): Promise<OptionEntities> => {
  const optionEntities = await Protocol.getOptionsUsingMultiCall(
    chainId,
    optionAddresses,
    provider
  )
  return optionEntities
}

export default useOptionEntities
