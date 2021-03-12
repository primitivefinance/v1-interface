import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { DEFAULT_TIMELIMIT, Operation } from '@/constants/index'
import { splitSignature } from '@ethersproject/bytes'
import { parseEther, formatEther, parseUnits } from 'ethers/lib/utils'

import { signDaiPermit, signERC2612Permit } from 'eth-permit'

import Dai from '@primitivefi/v1-connectors/deployments/rinkeby/Dai.json'
import IPERMIT from '@primitivefi/v1-connectors/build/contracts/interfaces/IERC20Permit.sol/IERC20Permit.json'

import { Contract } from '@ethersproject/contracts'
import { DEFAULT_DEADLINE } from '@/constants/index'
import ethers from 'ethers'
import { STABLECOINS } from '@primitivefi/sdk'

export const usePermit = () => {
  const { account, library, chainId } = useWeb3React()

  const handlePermit = useCallback(
    async (token: string, spender: string, value: string): Promise<any> => {
      const deadline = 1000000000000000
      const nonce: number = +(await new ethers.Contract(
        token,
        IPERMIT.abi,
        library
      ).nonces(account))
      const result = await signERC2612Permit(
        library,
        token,
        account,
        spender,
        value,
        deadline,
        nonce
      )
      console.log(
        `normal permit params: ${[token, account, spender, value, deadline]}`
      )
      return {
        v: result.v,
        r: result.r,
        s: result.s,
        deadline: deadline,
      }
    },
    [account]
  )

  return handlePermit
}

export const useDAIPermit = () => {
  const { account, library, chainId } = useWeb3React()

  const handlePermit = useCallback(
    async (spender: string): Promise<any> => {
      const deadline = 1000000000000000
      const result = await signDaiPermit(
        library,
        STABLECOINS[chainId].address,
        account,
        spender,
        deadline
      )
      return {
        v: result.v,
        r: result.r,
        s: result.s,
        deadline: deadline,
      }
    },
    [account]
  )

  return handlePermit
}
