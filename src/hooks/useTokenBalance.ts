import { useCallback, useEffect, useState } from 'react'
import { parseEther, formatEther } from 'ethers/lib/utils'

import { useWeb3React } from '@web3-react/core'

import { getBalance } from '@primitivefi/sdk'
import { BigNumberish } from 'ethers'
import { isAddress, getAddress } from '@ethersproject/address'

const useTokenBalance = (tokenAddress: string, from?: string) => {
  const [balance, setBalance] = useState('0')
  const { account, library } = useWeb3React()

  const fetchBalance = useCallback(async () => {
    if (typeof tokenAddress === 'undefined' || tokenAddress === '') return
    if (!isAddress(getAddress(tokenAddress))) return
    const code: any = await library.getCode(tokenAddress)
    let balance: BigNumberish = 0
    if (code > 0) {
      balance = await getBalance(library, tokenAddress, from ? from : account)
    }
    if (balance) {
      setBalance(formatEther(balance))
    }
  }, [account, library, tokenAddress, from])

  useEffect(() => {
    if (account && library) {
      fetchBalance()
      const refreshInterval = setInterval(fetchBalance, 50000000)
      return () => clearInterval(refreshInterval)
    }
  }, [account, library, setBalance, tokenAddress])

  return balance
}

export default useTokenBalance
