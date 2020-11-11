import { useContext, useMemo } from 'react'

import { useAllTransactions } from '@/state/transactions/hooks'

export const useHasPendingApproval = (): ((
  tokenAddress: string | undefined,
  spender: string | undefined
) => boolean) => {
  const transactions = useAllTransactions()

  const isApproved = (
    tokenAddress: string | undefined,
    spender: string | undefined
  ): any => {
    typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(transactions).some((hash) => {
        const tx = transactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          const approval = tx.approval
          if (!approval) return false
          return (
            approval.spender === spender &&
            approval.tokenAddress === tokenAddress
          )
        }
      })
  }
  return isApproved
}
