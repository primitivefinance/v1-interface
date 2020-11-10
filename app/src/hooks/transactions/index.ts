import { useContext, useMemo } from 'react'
import { TransactionContext } from '@/contexts/Transactions'

const useTransactions = () => {
  return useContext(TransactionContext)
}

export default useTransactions

export const useHasPendingApproval = (
  tokenAddress: string | undefined,
  spender: string | undefined
): boolean => {
  const { transactions } = useTransactions()
  return useMemo(
    () =>
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
      }),
    [useTransactions, spender, tokenAddress]
  )
}
