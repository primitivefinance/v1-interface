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
import { Operation, STABLECOINS } from '@/constants/index'
import numeral from 'numeral'
import formatEtherBalance from '@/utils/formatEtherBalance'
import formatBalance from '@/utils/formatBalance'
import useTokenBalance from '@/hooks/useTokenBalance'

import { formatEther } from 'ethers/lib/utils'
const BalanceCard: React.FC = () => {
  const { loading, balance } = usePositions()
  const { calls, puts } = useOptions()
  const addTransaction = useTransactionAdder()
  const { library, account, chainId } = useWeb3React()
  const daiBal = useTokenBalance(STABLECOINS[chainId].address)

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
    <>
      <div style={{ marginTop: '-.1em' }} />
      <Card border dark>
        <CardContent>
          <StyledContainer>
            <LineItem label={`DAI Balance`} data={daiBal} />
            <Spacer size="sm" />
            <LineItem
              label={`${balance.asset.symbol} Balance`}
              data={formatEther(balance.quantity)}
            />
            {chainId === 4 ? (
              <>
                <Spacer size="sm" />
                <Button
                  full
                  onClick={handleMintTestTokens}
                  text={'Get Testnet Tokens'}
                  variant="secondary"
                />
              </>
            ) : null}
          </StyledContainer>
        </CardContent>
      </Card>
    </>
  )
}
const StyledContainer = styled.div`
  margin: 0 1em 0 1em;
`

export default BalanceCard
