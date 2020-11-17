import React, { useEffect } from 'react'
import styled from 'styled-components'

import Button from '@/components/Button'
import Spacer from '@/components/Spacer'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import LineItem from '@/components/LineItem'
import { useItem } from '@/state/order/hooks'
import { useWeb3React } from '@web3-react/core'

import mintTestTokens from '@/utils/mintTestTokens'
import { useTransactionAdder } from '@/state/transactions/hooks'
import { useOptions } from '@/state/options/hooks'
import { usePositions } from '@/state/positions/hooks'
import { Operation } from '@/constants/index'
import numeral from 'numeral'

const BalanceCard: React.FC = () => {
  const { loading, balance } = usePositions()
  const { calls, puts } = useOptions()
  const addTransaction = useTransactionAdder()

  const { library, account, chainId } = useWeb3React()

  const handleMintTestTokens = async () => {
    const now = () => new Date().getTime()
    let tx: any
    mintTestTokens(
      account,
      calls[0].entity.assetAddresses[0],
      await library.getSigner()
    )
      .then((tx) => {
        if (tx?.hash) {
          addTransaction(
            {
              hash: tx.hash,
              addedTime: now(),
              from: account,
            },
            Operation.MINT
          )
        }
      })
      .catch((err) =>
        console.log(`Issue when minting test tokens in component ${err}`)
      )

    return tx
  }
  if (loading) return null
  if (calls.length === 0) return null
  return (
    <Card border>
      <CardContent>
        <LineItem
          label={`${balance.asset.symbol} Balance`}
          data={numeral(balance.quantity).format('0a')}
        />
        {chainId === 4 ? (
          <>
            <Spacer />
            <Button
              onClick={handleMintTestTokens}
              text={'Get Testnet Tokens'}
              variant="secondary"
            />
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
const StyledContainer = styled.div``

export default BalanceCard
