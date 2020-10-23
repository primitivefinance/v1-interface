import React, { useCallback, useReducer } from 'react'
import reducer, {
  initialState,
  addTransaction,
  clearAllTransactions,
  finalizeTransaction,
  checkTransaction,
} from './reducer'

import {
  Transaction,
  TransactionState,
  SerializableTransactionReceipt,
} from './types'

import { useLocalStorage } from '@/hooks/utils'
import { ChainId } from '@uniswap/sdk'
import TransactionContext from './context'

const Transactions: React.FC = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleAddTransaction = useCallback(
    (chainId: ChainId, tx: Transaction) => {
      dispatch(addTransaction(chainId, tx))
    },
    [dispatch]
  )
  const handleClearAllTransactions = useCallback(
    (chainId: ChainId) => {
      dispatch(clearAllTransactions(chainId))
    },
    [dispatch]
  )
  const handleFinalizeTransaction = useCallback(
    (
      chainId: ChainId,
      tx: Transaction,
      receipt: SerializableTransactionReceipt
    ) => {
      dispatch(finalizeTransaction(chainId, receipt, tx))
    },
    [dispatch]
  )
  const handleCheckTransaction = useCallback(
    (chainId: ChainId, blockNumber: number, tx: Transaction) => {
      dispatch(checkTransaction(chainId, blockNumber, tx))
    },
    [dispatch]
  )

  return (
    <TransactionContext.Provider
      value={{
        transactions: state,
        addTransaction: handleAddTransaction,
        clearAllTransactions: handleClearAllTransactions,
        finalizeTransaction: handleFinalizeTransaction,
        checkTransaction: handleCheckTransaction,
      }}
    >
      {props.children}
    </TransactionContext.Provider>
  )
}

export default Transactions
