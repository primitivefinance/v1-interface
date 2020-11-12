import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { approve } from '@/lib/erc20'

const useApprove = (tokenAddress: string, spender: string) => {
  const { account, library } = useWeb3React()

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve(
        await library.getSigner(),
        tokenAddress,
        account,
        spender
      )
      return tx
    } catch (e) {
      return false
    }
  }, [account, tokenAddress, spender])

  return { onApprove: handleApprove }
}

export default useApprove
