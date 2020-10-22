import {
  SerializableTransactionReceipt,
  Transaction,
  TransactionState,
} from './types'

import { ChainId } from '@uniswap/sdk'

export const initialState = {}

export interface AddTransactionAction {
  type: string
  chainId: ChainId
  tx: Transaction
}

export interface ClearAllTransactionsAction {
  type: string
  chainId: ChainId
}

export interface FinalizeTransactionsAction {
  type: string
  chainId: ChainId
  receipt: SerializableTransactionReceipt
  tx: Transaction
}

export interface CheckedTransactionAction {
  type: string
  chainId: ChainId
  blockNumber: number
  tx: Transaction
}

export type TransactionAction =
  | AddTransactionAction
  | ClearAllTransactionsAction
  | FinalizeTransactionsAction
  | CheckedTransactionAction

export const addTransaction = (
  chainId: ChainId,
  tx: Transaction
): AddTransactionAction => ({
  type: 'ADD',
  chainId,
  tx,
})
export const clearAllTransactions = (
  chainId: ChainId
): ClearAllTransactionsAction => ({
  type: 'CLEAR',
  chainId,
})
export const finalizeTransaction = (
  chainId: ChainId,
  receipt: SerializableTransactionReceipt,
  tx: Transaction
): FinalizeTransactionsAction => ({
  type: 'FINALIZE',
  chainId,
  receipt,
  tx,
})
export const checkTransaction = (
  chainId: ChainId,
  blockNumber: number,
  tx: Transaction
): CheckedTransactionAction => ({
  type: 'CHECKED',
  chainId,
  blockNumber,
  tx,
})

// using any to infer action type -> TODO: make the interfaces work
const reducer = (state: TransactionState = initialState, action: any) => {
  const now = () => new Date().getTime()
  switch (action.type) {
    case 'ADD':
      return {
        state: state[action.chainId][action.tx.hash] = action.tx,
      }
    case 'CLEAR':
      return {
        state: state[action.chainId] = {},
      }
    case 'FINALIZE':
      /*eslint-disable-next-line*/
      const fin = action.tx
      fin.receipt = action.receipt
      fin.confirmedTime = now()
      return {
        state: state[action.chainId][action.tx.hash] = fin,
      }
    case 'CHECKED':
      /*eslint-disable-next-line*/
      const check = action.tx
      if (!check.lastCheckedBlockNumber) {
        check.lastCheckedBlockNumber = action.blockNumber
      }
      return {
        state: state[action.chainId][action.tx.hash].lastCheckedBlockNumber =
          action.blockNumber,
      }
    default:
      return state
  }
}

export default reducer
