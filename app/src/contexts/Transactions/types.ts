import { ChainId } from '@uniswap/sdk'

export interface TransactionContextValues {
  transactions: TransactionState | null
  addTransaction: (chainId: ChainId, tx: Transaction) => void
  clearAllTransactions: (chainId: ChainId) => void
  finalizeTransaction: (
    chainId: ChainId,
    tx: Transaction,
    receipt: SerializableTransactionReceipt
  ) => void
  checkTransaction: (
    chainId: ChainId,
    blockNumber: number,
    tx: Transaction
  ) => void
}

export interface SerializableTransactionReceipt {
  to: string
  from: string
  contractAddress: string
  transactionIndex: number
  blockHash: string
  transactionHash: string
  blockNumber: number
  status?: number
}

export interface Transaction {
  hash: string
  approval?: { tokenAddress: string; spender: string }
  summary?: string
  claim?: { recipient: string }
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
}

export type TransactionState = {
  [chainId in ChainId]: {
    [txHash: string]: Transaction
  }
}

export const nullState = { 1: {}, 3: {}, 4: {}, 5: {}, 42: {} }
