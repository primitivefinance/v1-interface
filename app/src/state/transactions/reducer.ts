import { createReducer } from '@reduxjs/toolkit'
import {
  addTransaction,
  checkedTransaction,
  clearAllTransactions,
  finalizeTransaction,
  SerializableTransactionReceipt,
  Transaction,
} from './actions'

const now = () => new Date().getTime()

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: Transaction
  }
}

export const initialState: TransactionState = {}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addTransaction, (transactions, { payload: { chainId, tx } }) => {
      if (transactions[chainId]?.[tx.hash]) {
        throw Error('Attempted to add existing transaction.')
      }
      const txs = transactions[chainId] ?? {}
      txs[tx.hash] = {
        ...tx,
        addedTime: now(),
      }
      transactions[chainId] = txs
      return transactions
    })
    .addCase(clearAllTransactions, (transactions, { payload: { chainId } }) => {
      if (!transactions[chainId]) return
      transactions[chainId] = {}
      return transactions
    })
    .addCase(
      checkedTransaction,
      (transactions, { payload: { chainId, hash, blockNumber } }) => {
        const tx = transactions[chainId]?.[hash]
        if (!tx) {
          return
        }
        if (!tx.lastCheckedBlockNumber) {
          tx.lastCheckedBlockNumber = blockNumber
        } else {
          tx.lastCheckedBlockNumber = Math.max(
            blockNumber,
            tx.lastCheckedBlockNumber
          )
        }
      }
    )
    .addCase(
      finalizeTransaction,
      (transactions, { payload: { chainId, hash, receipt } }) => {
        const tx = transactions[chainId]?.[hash]
        if (!tx) {
          return
        }
        tx.receipt = receipt
        tx.confirmedTime = now()
      }
    )
)
