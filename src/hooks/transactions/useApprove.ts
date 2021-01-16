import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { approve } from '@primitivefi/sdk'
import { Operation } from '@/constants/index'
import ethers from 'ethers'

import { useTransactionAdder } from '@/state/transactions/hooks'
import { useAddNotif } from '@/state/notifs/hooks'

const useApprove = () => {
  const { account, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const now = () => new Date().getTime()
  const throwError = useAddNotif()

  const handleApprove = useCallback(
    async (
      tokenAddress: string,
      spender: string
    ): Promise<ethers.Transaction | any> => {
      const signer = await library.getSigner()
      approve(signer, tokenAddress, account, spender)
        .then((tx) => {
          if (tx?.hash) {
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
          throwError(0, 'Approvals Error', `${err.message}`, '')
        })
    },
    [account]
  )

  return handleApprove
}

export default useApprove
