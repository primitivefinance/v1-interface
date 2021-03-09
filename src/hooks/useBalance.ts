import { BigNumberish } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'
import { parseEther, formatEther } from 'ethers/lib/utils'

const useBalance = (from?: string) => {
  const [balance, setBalance] = useState('0')
  const { account, library } = useWeb3React()

  const fetchBalance = useCallback(async () => {
    let balance: BigNumberish = await (await library.getSigner()).getBalance()
    if (balance) {
      setBalance(formatEther(balance))
    }
  }, [account, library, from])

  useEffect(() => {
    if (account && library) {
      fetchBalance()
      const refreshInterval = setInterval(fetchBalance, 50000000)
      return () => clearInterval(refreshInterval)
    }
  }, [account, library, setBalance])

  return balance
}

export default useBalance
