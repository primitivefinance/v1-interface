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
import { LocalStorageKeys } from '../../constants/index'

const Transactions: React.FC = (props) => {
  const [stored, setStorage] = useLocalStorage<TransactionState>(
    LocalStorageKeys.Transactions,
    initialState
  )
  const [state, dispatch] = useReducer(reducer, stored)

  const handleAddTransaction = useCallback(
    (chainId: ChainId, tx: Transaction) => {
      dispatch(addTransaction(chainId, tx))
      setStorage(state)
    },
    [dispatch]
  )
  const handleClearAllTransactions = useCallback(
    (chainId: ChainId) => {
      dispatch(clearAllTransactions(chainId))
      setStorage(state)
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
