import React, { useEffect } from 'react'
import styled from 'styled-components'

import Button from '@/components/Button'
import Spacer from '@/components/Spacer'
import Card from '@/components/Card'
import Loader from '@/components/Loader'
import CardContent from '@/components/CardContent'
import LineItem from '@/components/LineItem'
import { useWeb3React } from '@web3-react/core'

//import mintTestTokens from '@/utils/mintTestTokens'
import { useTransactionAdder } from '@/state/transactions/hooks'
import { useOptions } from '@/state/options/hooks'
import { usePositions } from '@/state/positions/hooks'
import { useItem } from '@/state/order/hooks'

import useTokenBalance from '@/hooks/useTokenBalance'
import { mintTestTokens, WETH9, Operation, STABLECOINS } from '@primitivefi/sdk'

import { formatEther } from 'ethers/lib/utils'
const BalanceCard: React.FC = () => {
  const { loading, balance } = usePositions()
  const options = useOptions()
  const { item } = useItem()
  const addTransaction = useTransactionAdder()
  const { library, account, chainId } = useWeb3React()
  const daiBal = useTokenBalance(STABLECOINS[chainId].address)
  const ethBal = useTokenBalance(WETH9[chainId].address)

  const handleMintTestTokens = async () => {
    const now = () => new Date().getTime()
    let tx: any
    mintTestTokens(await library.getSigner(), account)
      .then((txs) => {
        txs.map((tx) => {
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
      })
      .catch((err) =>
        console.log(`Issue when minting test tokens in component ${err}`)
      )
    return tx
  }
  if (loading) {
    if (item.entity === null) {
      return null
    } else {
      return (
        <>
          <CustomCard>
            <Spacer size="sm" />
            <Loader />
          </CustomCard>
        </>
      )
    }
  }
  return (
    <>
      <CustomCard>
        {/* <LineItem
          label={`${balance.token.symbol} Balance`}
          data={formatEther(balance.raw.toString())}
        /> */}
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
        <Spacer size="sm" />
        <LineItem label={`DAI Balance`} data={daiBal} />
        <LineItem label={`WETH Balance`} data={ethBal} />
      </CustomCard>
    </>
  )
}
const CustomCard = styled.div`
  padding: 1em;
  margin: -0.1em 0em 0em 0em;
  background-color: ${(props) => props.theme.color.grey[800]};
  border: 1px solid ${(props) => props.theme.color.grey[500]};
  border-radius: 0 0 ${(props) => props.theme.borderRadius}px
    ${(props) => props.theme.borderRadius}px;
  box-shadow: 3px 3px 3px rgba(250, 250, 250, 0.05);
  z-index: 0;
`

export default BalanceCard
