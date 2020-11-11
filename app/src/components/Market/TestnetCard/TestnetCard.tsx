import React, { useEffect } from 'react'
import styled from 'styled-components'

import Button from '@/components/Button'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import { useItem } from '@/state/order/hooks'
import { useWeb3React } from '@web3-react/core'

interface TestnetCardProps {}
import mintTestTokens from '@/utils/mintTestTokens'
import { useTransactionAdder } from '@/state/transactions/hooks'
import { Operation } from '@/constants/index'

const TestnetCard: React.FC<TestnetCardProps> = () => {
  const { item } = useItem()
  const addTransaction = useTransactionAdder()

  const { library, account, chainId } = useWeb3React()
  useEffect(() => {}, [item])

  const handleMintTestTokens = async () => {
    const now = () => new Date().getTime()
    let tx: any
    mintTestTokens(
      account,
      item.entity.assetAddresses[0],
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

  return (
    <Card>
      <StyledContainer>
        <CardContent>
          <Button
            onClick={handleMintTestTokens}
            text={'Get Test Tokens'}
            variant="default"
          />
        </CardContent>
      </StyledContainer>
    </Card>
  )
}
const StyledContainer = styled.div``

export default TestnetCard
