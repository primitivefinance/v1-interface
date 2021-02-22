import { useCallback, useEffect, useState } from 'react'
import { formatEther } from 'ethers/lib/utils'
import { useWeb3React } from '@web3-react/core'
import { getAllowance } from '@primitivefi/sdk'
import { BigNumberish } from 'ethers'

import { isAddress, getAddress } from '@ethersproject/address'

const useTokenAllowance = (tokenAddress: string, spender: string) => {
  const [allowance, setAllowance] = useState('0')
  const { account, library } = useWeb3React()

  const fetchAllowance = useCallback(async () => {
    if (typeof tokenAddress === 'undefined' || tokenAddress === '') return
    if (!isAddress(getAddress(tokenAddress))) return
    const code: any = await library.getCode(tokenAddress)
    let allowance: BigNumberish = '0'
    if (code > 0) {
      allowance = await getAllowance(library, tokenAddress, account, spender)
    }
    if (allowance) {
      setAllowance(formatEther(allowance).toString())
    }
  }, [account, library, tokenAddress])

  useEffect(() => {
    if (account && library) {
      fetchAllowance()
      const refreshInterval = setInterval(fetchAllowance, 50000000)
      return () => clearInterval(refreshInterval)
    }
  }, [account, library, setAllowance, tokenAddress])
  return allowance
}

export const useGetTokenAllowance = (): ((
  tokenAddress: string,
  spender: string
) => Promise<any>) => {
  const { account, library } = useWeb3React()
  const fetchAllowance = async (tokenAddress, spender) => {
    if (typeof tokenAddress === 'undefined' || tokenAddress === '') return
    if (!isAddress(getAddress(tokenAddress))) return
    const code: any = await library.getCode(tokenAddress)
    let allowance: BigNumberish = '0'
    if (code > 0) {
      allowance = await getAllowance(library, tokenAddress, account, spender)
    }
    return allowance
  }
  return useCallback(
    async (tokenAddress: string, spender: string) => {
      return await fetchAllowance(tokenAddress, spender)
    },
    [fetchAllowance]
  )
}
export default useTokenAllowance
