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
import {
  useApprovalQueue,
  ApprovalProgress,
} from '@/hooks/transactions/useApprovalQueue'
import { Operation, DEFAULT_ALLOWANCE } from '@/constants/index'

import { LocalStorageKeys } from '../../constants/index'

const Transactions: React.FC = (props) => {
  const [stored, setStorage] = useLocalStorage<TransactionState>(
    LocalStorageKeys.Transactions,
    initialState
  )
  const { queue, createQueue, addToQueue } = useApprovalQueue()

  const [state, dispatch] = useReducer(reducer, stored)

  const handleAddTransaction = useCallback(
    (chainId: ChainId, tx: Transaction, orderType?: Operation) => {
      dispatch(addTransaction(chainId, tx))
      if (tx.approval) {
        if (!queue.approvals) {
          console.log('Empty approval queue, creating new queue')
          createQueue(orderType, [
            {
              progress: ApprovalProgress.PENDING,
              tokenAddress: tx.approval.tokenAddress,
              amountToApprove: DEFAULT_ALLOWANCE,
            },
          ])
        } else {
          console.log('Added tx to queue')
          addToQueue({
            progress: ApprovalProgress.PENDING,
            tokenAddress: tx.approval.tokenAddress,
            amountToApprove: DEFAULT_ALLOWANCE,
          })
        }
      }

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
