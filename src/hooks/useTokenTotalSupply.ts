import { useCallback, useEffect, useState } from 'react'
import { formatEther } from 'ethers/lib/utils'

import { useWeb3React } from '@web3-react/core'

import { getBalance, getTotalSupply } from '@primitivefi/sdk'
import { BigNumberish } from 'ethers'
import { isAddress, getAddress } from '@ethersproject/address'

const useTokenTotalSupply = (tokenAddress: string) => {
  const [totalSupply, setTotalSupply] = useState('0')
  const { account, library } = useWeb3React()

  const fetchTotalSupply = useCallback(async () => {
    if (typeof tokenAddress === 'undefined' || tokenAddress === '') return
    if (!isAddress(getAddress(tokenAddress))) return
    let code: any = await library.getCode(tokenAddress)
    let totalSupply: BigNumberish = 0
    if (code > 0) {
      totalSupply = await getTotalSupply(library, tokenAddress)
    }
    if (totalSupply) {
      setTotalSupply(formatEther(totalSupply).toString())
    }
  }, [account, library, tokenAddress])

  useEffect(() => {
    if (account && library) {
      fetchTotalSupply()
      const refreshInterval = setInterval(fetchTotalSupply, 50000000)
      return () => clearInterval(refreshInterval)
    }
  }, [account, library, setTotalSupply, tokenAddress])

  return totalSupply
}

export default useTokenTotalSupply
