import React, { useEffect } from 'react'
import styled from 'styled-components'

import Button from 'components/Button'
import Card from 'components/Card'
import CardContent from 'components/CardContent'
import Spacer from 'components/Spacer'
import LaunchIcon from '@material-ui/icons/Launch'

import useOrders from '../../../hooks/useOrders'
import { useWeb3React } from '@web3-react/core'

interface TestnetCardProps {}

const TestnetCard: React.FC<TestnetCardProps> = () => {
  const { item, loadPendingTx, mintTestTokens } = useOrders()
  const { library } = useWeb3React()
  useEffect(() => {}, [item])
  useEffect(() => {
    ;(async () => {
      loadPendingTx()
    })()
  }, [loadPendingTx])

  const handleMintTestTokens = async () => {
    await mintTestTokens(
      library,
      '0xBa8980CA505E7f48a177BBfA3AB90c9F01699110',
      100
    )
  }

  return (
    <Card>
      <StyledContainer>
        <CardContent>
          <StyledTitle>
            Earn NFT Rewards
            <Button
              href="https://primitive.finance/beta"
              variant="transparent"
              text="Learn more"
              size="sm"
            >
              <Spacer size="sm" />
              <LaunchIcon fontSize="small" />
            </Button>
          </StyledTitle>
          Click the open button next to the options to trade.
          <Spacer />
          <StyledTitle>1.</StyledTitle>
          <Button
            onClick={handleMintTestTokens}
            text={'Get Test Tokens'}
            variant="default"
          />
          <Spacer />
          <StyledTitle>2.</StyledTitle>
          <Button
            onClick={handleMintTestTokens}
            text={'Make a Trade'}
            variant="default"
            disabled
          />
          <Spacer />
          <StyledTitle>3.</StyledTitle>
          <Button
            onClick={handleMintTestTokens}
            text={'Claim NFT Reward'}
            variant="default"
            disabled
          />
        </CardContent>
      </StyledContainer>
    </Card>
  )
}

const StyledTitle = styled.h1`
  align-items: center;
  color: ${(props) => props.theme.color.white};
  display: flex;
  font-size: 18px;
  font-weight: 700;
`

const StyledContainer = styled.div`
  background: linear-gradient(
    45deg,
    rgba(255, 0, 0, 0.75) 0%,
    rgba(255, 154, 0, 0.75) 10%,
    rgba(208, 222, 33, 0.75) 20%,
    rgba(79, 220, 74, 0.75) 30%,
    rgba(63, 218, 216, 0.75) 40%,
    rgba(47, 201, 226, 0.75) 50%,
    rgba(28, 127, 238, 0.75) 60%,
    rgba(95, 21, 242, 0.75) 70%,
    rgba(186, 12, 248, 0.75) 80%,
    rgba(251, 7, 217, 0.75) 90%,
    rgba(255, 0, 0, 0.75) 100%
  );
`

export default TestnetCard
