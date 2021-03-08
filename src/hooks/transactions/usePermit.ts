import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Operation } from '@/constants/index'
import { splitSignature } from '@ethersproject/bytes'
import { parseEther, formatEther, parseUnits } from 'ethers/lib/utils'

import Dai from '@primitivefi/v1-connectors/deployments/live/Dai.json'
import { Dai as TestDai } from '@primitivefi/v1-connectors/deployments/rinkeby/Dai.json'

import { Contract } from '@ethersproject/contracts'
import { DEFAULT_DEADLINE } from '@/constants/index'

const usePermit = () => {
  const { account, library, chainId } = useWeb3React()

  const handlePermit = useCallback(
    async (
      tokenAddress: string,
      spender: string,
      amount?: string
    ): Promise<any> => {
      const signer = await library.getSigner()
      const contract = new Contract(
        chainId === 4 ? TestDai.address : Dai.address,
        chainId === 4 ? TestDai.abi : Dai.abi,
        signer
      )
      const nonce = await contract.nonces(account)

      const EIP712Domain = [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ]
      const domain = {
        name: 'Primitive',
        version: '1',
        chainId: '1',
        verifyingContract: spender,
      }
      const Permit = [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ]
      const message = {
        account,
        spender,
        value: parseUnits(amount.toString()).toString(),
        nonce: nonce.toHexString(),
        deadline: DEFAULT_DEADLINE,
      }
      const data = JSON.stringify({
        types: {
          EIP712Domain,
          Permit,
        },
        domain,
        primaryType: 'Permit',
        message,
      })

      library
        .send('eth_signTypedData_v4', [account, data])
        .then(splitSignature)
        .then((signature) => {
          return {
            v: signature.v,
            r: signature.r,
            s: signature.s,
            deadline: DEFAULT_DEADLINE,
          }
        })
        .catch((error) => {
          // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
          if (error?.code !== 4001) {
            throw 'Error'
          }
        })
    },
    [account]
  )

  return handlePermit
}

export default usePermit
