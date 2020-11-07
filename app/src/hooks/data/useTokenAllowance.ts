import { useCallback, useEffect, useState } from 'react'
import { formatEther } from 'ethers/lib/utils'
import { useWeb3React } from '@web3-react/core'
import { getAllowance } from '../../lib/erc20'

export const useTokenAllowance = (tokenAddress: string, spender: string) => {
  const [allowance, setAllowance] = useState('0')
  const { account, library } = useWeb3React()

  const fetchBalance = useCallback(async () => {
    const allowance = await getAllowance(
      library,
      tokenAddress,
      account,
      spender
    )
    setAllowance(formatEther(allowance).toString())
  }, [account, library, tokenAddress])

  useEffect(() => {
    if (account && library) {
      fetchBalance()
      const refreshInterval = setInterval(fetchBalance, 10000)
      return () => clearInterval(refreshInterval)
    }
  }, [account, library, setAllowance, tokenAddress, fetchBalance])

  return allowance
}
