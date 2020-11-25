import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '@/hooks/user/index'
import { useBlockNumber } from '@/hooks/data/index'
import { AppDispatch, AppState } from '../index'
import { checkedTransaction, finalizeTransaction } from './actions'
import { useOptions, useUpdateOptions } from '@/state/options/hooks'
import { useUpdatePositions } from '@/state/positions/hooks'
import { useAddNotif } from '@/state/notifs/hooks'
import { useItem, useUpdateItem } from '@/state/order/hooks'
import formatExpiry from '@/utils/formatExpiry'
import { Operation } from '@/constants/index'
import numeral from 'numeral'
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
  const addNotif = useAddNotif()
  const { item, orderType, loading, approved, lpApproved } = useItem()
  const updateItem = useUpdateItem()

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
    const pull = async () => {
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
                if (summary) {
                  const type = summary.option.isCall ? 'calls' : 'puts'
                  let market
                  if (type === 'calls') {
                    market = summary.option.base.asset.symbol
                  } else {
                    market = summary.option.quote.asset.symbol
                  }
                  if (market === 'weth') {
                    market = 'eth'
                  }
                  const link = `https://app.primitive.finance/markets/${market}/${type}/${summary.option.address}/${summary.type}`

                  const exp = formatExpiry(summary.option.expiry)
                  addNotif(
                    2,
                    `Trade Confirmed`,
                    `${numeral(summary.amount).format('0.000a')} ${
                      summary.type
                    } ${market.toUpperCase()} ${type
                      .substr(0, type.length - 1)
                      .toUpperCase()} ${numeral(
                      summary.option.strikePrice.quantity.toString()
                    ).format('$0.00a')} ${exp.month}/${exp.date}/${exp.year}`,
                    `http://twitter.com/share?url=${link}&text=I+just+traded+${market.toUpperCase()}+options+on+%40PrimtiveFi`
                  )
                }
                const app = transactions[hash].approval
                if ((!approved && app) || (!lpApproved && app)) {
                  updateItem(item, orderType)
                }
              } else {
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
    }
    pull()
  }, [
    chainId,
    state,
    library,
    addNotif,
    transactions,
    lastBlockNumber,
    dispatch,
    options,
    updatePositions,
  ])

  return null
}
