import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Operation } from '@/constants/index'
import { splitSignature } from '@ethersproject/bytes'
import { parseEther, formatEther, parseUnits } from 'ethers/lib/utils'

import { signDaiPermit } from 'eth-permit'

import Dai from '@primitivefi/v1-connectors/deployments/rinkeby/Dai.json'

import { Contract } from '@ethersproject/contracts'
import { DEFAULT_DEADLINE } from '@/constants/index'

const usePermit = () => {
  const { account, library, chainId } = useWeb3React()

  const handlePermit = useCallback(
    async (spender: string): Promise<any> => {
      const result = await signDaiPermit(
        library,
        chainId === 4
          ? Dai.address
          : '0x9041f0ddaa47f40d59b9812887ccf36e0d2f696e',
        account,
        spender,
        60000
      )
      return {
        v: result.v,
        r: result.r,
        s: result.s,
        deadline: 60000,
      }
    },
    [account]
  )

  return handlePermit
}

export default usePermit
