import { useCallback, useEffect, useState } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { Option } from '@/lib/entities/option'
import { Protocol } from '@/lib/index'
import { useWeb3React } from '@web3-react/core'

export interface OptionEntities {
  [address: string]: Option
}

const useOptionEntities = (optionAddresses: string[]) => {
  const [entities, setEntities] = useState<OptionEntities>()
  const { library, chainId } = useWeb3React()

  const fetchOptionEntities = useCallback(async () => {
    if (optionAddresses) {
      const optionEntities = await Protocol.getOptionsUsingMultiCall(
        chainId,
        optionAddresses,
        library
      )
      if (library && optionEntities) {
        setEntities(optionEntities)
      }
    }
  }, [chainId, library, optionAddresses])

  useEffect(() => {
    if (chainId && library) {
      fetchOptionEntities()
      let refreshInterval = setInterval(fetchOptionEntities, 1000000000)
      return () => clearInterval(refreshInterval)
    }
  }, [setEntities, optionAddresses, library, chainId])

  return entities
}

export default useOptionEntities
