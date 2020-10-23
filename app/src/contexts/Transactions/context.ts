import { createContext } from 'react'
import { ChainId } from '@uniswap/sdk'

import { Transaction, TransactionContextValues, nullState } from './types'

const TransactionContext = createContext<TransactionContextValues>({
  transactions: nullState,
  addTransaction: async (chainId: ChainId, tx: Transaction) => {},
  clearAllTransactions: async (chainId: ChainId) => {},
  finalizeTransaction: async (chainId: ChainId) => {},
  checkTransaction: async (
    chainId: ChainId,
    blockNumber: number,
    tx: Transaction
  ) => {},
})

export default TransactionContext
