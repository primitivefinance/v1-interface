import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { approve } from '@/lib/erc20'
import { Operation } from '@/constants/index'

import { useTransactionAdder } from '@/state/transactions/hooks'
import { useAddNotif } from '@/state/notifs/hooks'

const useApprove = (tokenAddress: string, spender: string) => {
  const { account, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const now = () => new Date().getTime()
  const throwError = useAddNotif()

  const handleApprove = useCallback(async () => {
    approve(await library.getSigner(), tokenAddress, account, spender)
      .then((tx) => {
        if (tx.hash) {
          addTransaction(
            {
              approval: {
                tokenAddress: tokenAddress,
                spender: spender,
              },
              hash: tx.hash,
              addedTime: now(),
              from: account,
            },
            Operation.APPROVE
          )
        }
        return tx
      })
      .catch((err) => {
        throwError(0, '', `${err.message}`, '')
      })
  }, [account, tokenAddress, spender])

  return { onApprove: handleApprove }
}

export default useApprove
