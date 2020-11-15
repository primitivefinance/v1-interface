import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '@/hooks/user/index'
import { useBlockNumber } from '@/hooks/data/index'
import { AppDispatch, AppState } from '../index'
import { checkedTransaction, finalizeTransaction } from './actions'
import { useOptions, useUpdateOptions } from '@/state/options/hooks'
import { useUpdatePositions } from '@/state/positions/hooks'
import { addNotif } from '@/state/notifs/actions'
import { useItem } from '@/state/order/hooks'
import Link from 'next/link'

export function shouldCheck(
  lastBlockNumber: number,
  tx: { addedTime: number; receipt?: {}; lastCheckedBlockNumber?: number }
): boolean {
  if (tx.receipt) return false
  if (!tx.lastCheckedBlockNumber) return true
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber
  if (blocksSinceCheck < 1) return false
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2
  } else {
    // otherwise every block
    return true
  }
}

export default function Updater(): null {
  const { chainId, library } = useActiveWeb3React()
  const options = useOptions()
  const updatePositions = useUpdatePositions()
  const { data } = useBlockNumber()
  const lastBlockNumber = data
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector<AppState, AppState['transactions']>(
    (state) => state.transactions
  )
  const transactions = chainId ? state[chainId] ?? {} : {}

  useEffect(() => {
    if (!chainId || !library || !lastBlockNumber || options.loading) return
    if (!options.loading) {
      updatePositions(options.calls.concat(options.puts))
    }
    Object.keys(transactions)
      .filter((hash) => shouldCheck(lastBlockNumber, transactions[hash]))
      .forEach((hash) => {
        library
          .getTransactionReceipt(hash)
          .then((receipt) => {
            if (receipt) {
              dispatch(
                finalizeTransaction({
                  chainId,
                  hash,
                  receipt: {
                    blockHash: receipt.blockHash,
                    blockNumber: receipt.blockNumber,
                    contractAddress: receipt.contractAddress,
                    from: receipt.from,
                    status: receipt.status,
                    to: receipt.to,
                    transactionHash: receipt.transactionHash,
                    transactionIndex: receipt.transactionIndex,
                  },
                })
              )
              const summary = transactions[hash].summary
              console.log(summary)
              if (summary) {
                const link = `https://localhost:3000/markets/${summary.assetName.toLowerCase()}/${
                  summary.address
                }/${summary.type}`

                console.log(link)
                dispatch(
                  addNotif({
                    id: 2,
                    title: `Trade Confirmed`,
                    msg: `${summary.type} - ${summary.assetName} - ${summary.amount}`,
                    link: `https://twitter.com/share?url=${link}`,
                  })
                )
              }
            } else {
              console.log('checked tx')
              dispatch(
                checkedTransaction({
                  chainId,
                  hash,
                  blockNumber: lastBlockNumber,
                })
              )
            }
          })
          .catch((error) => {
            console.error(`failed to check transaction hash: ${hash}`, error)
          })
      })
  }, [chainId, library, transactions, lastBlockNumber, dispatch])

  return null
}
