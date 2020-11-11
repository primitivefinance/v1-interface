import { createContext } from 'react'
import { ChainId } from '@uniswap/sdk'
import { Operation } from '@/constants/index'

import { Transaction, TransactionContextValues, nullState } from './types'

const TransactionContext = createContext<TransactionContextValues>({
  transactions: nullState,
  addTransaction: async (
    chainId: ChainId,
    tx: Transaction,
    orderType: Operation
  ) => {},
  clearAllTransactions: async (chainId: ChainId) => {},
  finalizeTransaction: async (chainId: ChainId) => {},
  checkTransaction: async (
    chainId: ChainId,
    blockNumber: number,
    tx: Transaction
  ) => {},
})

export default TransactionContext
