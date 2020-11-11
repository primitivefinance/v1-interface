import { useEffect } from 'react'
import { useActiveWeb3React } from '@/hooks/user'
import useTransactions from '@/hooks/transactions/index'
import { useBlockNumber } from '@/hooks/data'
import useOptions from '@/hooks/useOptions'
import usePositions from '@/hooks/usePositions'
import {
  useApprovalQueue,
  ApprovalProgress,
} from '@/hooks/transactions/useApprovalQueue'

export function shouldCheck(
  lastBlockNumber: number,
  tx: { addedTime: number; receipt?: unknown; lastCheckedBlockNumber?: number }
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

export default function Updater() {
  const { chainId, library } = useActiveWeb3React()
  const { queue, checkQueue } = useApprovalQueue()
  const { options } = useOptions()
  const { positions, getPositions } = usePositions()

  const { data } = useBlockNumber()
  const lastBlockNumber = data
  const {
    checkTransaction,
    finalizeTransaction,
    transactions,
  } = useTransactions()

  const txs = chainId ? transactions[chainId] ?? {} : {}

  // handle confirmed tx

  useEffect(() => {
    if (!chainId || !library || !lastBlockNumber) return

    Object.keys(txs)
      .filter((hash) => shouldCheck(lastBlockNumber, txs[hash]))
      .forEach((hash) => {
        library
          .getTransactionReceipt(hash)
          .then((receipt) => {
            if (receipt) {
              finalizeTransaction(chainId, txs[hash], {
                blockHash: receipt.blockHash,
                blockNumber: receipt.blockNumber,
                contractAddress: receipt.contractAddress,
                from: receipt.from,
                status: receipt.status,
                to: receipt.to,
                transactionHash: receipt.transactionHash,
                transactionIndex: receipt.transactionIndex,
              })
              checkQueue()
            } else {
              checkTransaction(chainId, lastBlockNumber, txs[hash])
            }
          })
          .catch((error) => {
            console.error(`failed to check transaction hash: ${hash}`, error)
          })
      })
    if (!options.loading) {
      const temp = options.calls.concat(options.puts)
      console.log('Updating positions', temp)
      getPositions(temp)
    }
  }, [
    chainId,
    library,
    transactions,
    lastBlockNumber,
    txs,
    finalizeTransaction,
    checkTransaction,
    getPositions,
    options,
  ])

  return null
}
