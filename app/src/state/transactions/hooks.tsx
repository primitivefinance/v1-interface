import { TransactionResponse } from '@ethersproject/providers'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Operation } from '@/constants/index'

import { useActiveWeb3React } from '@/hooks/user/index'
import { AppDispatch, AppState } from '../index'
import { addTransaction, Transaction } from './actions'

export const useTransactionAdder = (): ((
  tx: Transaction,
  orderType: Operation
) => void) => {
  const { chainId, account } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (tx, orderType) => {
      if (!account) return
      if (!chainId) return

      const { hash } = tx
      if (!hash) {
        throw Error('No transaction hash found.')
      }
      dispatch(
        addTransaction({
          chainId,
          tx,
          orderType,
        })
      )
    },
    [dispatch, chainId, account]
  )
}

export const useAllTransactions = (): {
  [txHash: string]: Transaction
} => {
  const { chainId } = useActiveWeb3React()

  const state = useSelector<AppState, AppState['transactions']>(
    (state) => state.transactions
  )

  return chainId ? state[chainId] ?? {} : {}
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions()

  if (!transactionHash || !transactions[transactionHash]) return false

  return !transactions[transactionHash].receipt
}

export function isTransactionRecent(tx: Transaction): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000
}

export function useHasPendingApproval(
  tokenAddress: string | undefined,
  spender: string | undefined
): boolean {
  const allTransactions = useAllTransactions()
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          const approval = tx.approval
          if (!approval) return false
          return (
            approval.spender === spender &&
            approval.tokenAddress === tokenAddress &&
            isTransactionRecent(tx)
          )
        }
      }),
    [allTransactions, spender, tokenAddress]
  )
}
