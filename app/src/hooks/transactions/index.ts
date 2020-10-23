import { useContext } from 'react'
import { TransactionContext } from '@/contexts/Transactions'

const useTransactions = () => {
  return useContext(TransactionContext)
}

export default useTransactions
