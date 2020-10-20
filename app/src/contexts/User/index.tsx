import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react'

import {
  Transaction,
  CURRENT_VERSION,
  NO_VERSION,
  LocalStorageKeys,
  Token,
} from '../../constants'

import { useLocalStorage } from '@/hooks/utils'

const UserContext = createContext<
  [
    {
      stablecoin: Token | undefined
      transactions: Transaction[]
    },
    {
      setStablecoin: Dispatch<SetStateAction<Token | undefined>>
      setTransactions: Dispatch<SetStateAction<Transaction[] | undefined>>
    }
  ]
>([{}, {}] as any) // eslint-disable-line @typescript-eslint/no-explicit-any

function useUserContext() {
  return useContext(UserContext)
}

export default function Provider({ children }: { children: ReactNode }) {
  const [stablecoin, setStablecoin] = useState<Token | undefined>()
  const [version, setVersion] = useLocalStorage<number>(
    LocalStorageKeys.Version,
    NO_VERSION
  )

  useEffect(() => {
    setVersion(CURRENT_VERSION)
  }, [setVersion])

  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    LocalStorageKeys.Transactions,
    []
  )

  return (
    <UserContext.Provider
      value={useMemo(
        () => [
          { stablecoin, transactions },
          {
            setStablecoin,
            setTransactions,
          },
        ],
        [stablecoin, transactions, setStablecoin, setTransactions]
      )}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useStablecoin = (): [
  Token | undefined,
  ReturnType<typeof useUserContext>[1]['setStablecoin']
] => {
  const [{ stablecoin }, { setStablecoin }] = useUserContext()
  return [stablecoin, setStablecoin]
}

export const useTransactions = (): [
  Transaction[],
  {
    addTransaction: (chainId: number, hash: string) => void
    removeTransaction: (chainId: number, hash: string) => void
  }
] => {
  const [{ transactions }, { setTransactions }] = useUserContext()

  const addTransaction = useCallback(
    (chainId: number, hash: string) => {
      setTransactions((transactions) =>
        transactions
          .filter(
            (transaction) =>
              !(transaction.chainId === chainId && transaction.hash === hash)
          )
          .concat([{ chainId, hash }])
      )
    },
    [setTransactions]
  )
  const removeTransaction = useCallback(
    (chainId: number, hash: string) => {
      setTransactions((transactions) =>
        transactions.filter(
          (transaction) =>
            !(transaction.chainId === chainId && transaction.hash === hash)
        )
      )
    },
    [setTransactions]
  )

  return [transactions, { addTransaction, removeTransaction }]
}
