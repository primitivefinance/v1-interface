import React, { useEffect } from 'react'
import styled from 'styled-components'

import Button from '@/components/Button'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import Spacer from '@/components/Spacer'
import LaunchIcon from '@material-ui/icons/Launch'
import useTransactions from '@/hooks/transactions'
import { useWeb3React } from '@web3-react/core'

const TransactionCard: React.FC<TestnetCardProps> = () => {
  const { transactions } = useTransactions()
  const { library } = useWeb3React()

  return (
    <>
      {!transactions ? (
        <Card>
          <StyledContainer>
            <CardContent>
              <StyledTitle>Transactions</StyledTitle>
              <Spacer />
            </CardContent>
          </StyledContainer>
        </Card>
      ) : (
        <></>
      )}
    </>
  )
}

const StyledText = styled.h4`
  align-items: center;
  color: ${(props) => props.theme.color.white};
  display: flex;
`

const StyledTitle = styled.h1`
  align-items: center;
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  font-size: 18px;
  font-weight: 700;
`

const StyledContainer = styled.div`
  background: ${(props) => props.theme.color.grey[800]};
`

export default TransactionCard
