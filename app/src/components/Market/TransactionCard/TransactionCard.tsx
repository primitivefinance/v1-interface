import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import Button from '@/components/Button'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import Spacer from '@/components/Spacer'
import LaunchIcon from '@material-ui/icons/Launch'
import useTransactions from '@/hooks/transactions'
import { useWeb3React } from '@web3-react/core'

import { nullState } from '@/contexts/Transactions/types'

const TransactionCard: React.FC = () => {
  const { transactions } = useTransactions()
  const { library, chainId } = useWeb3React()

  const txs = transactions[chainId]

  if (!txs) return null
  if (Object.keys(txs).length === 0 && txs.constructor === Object) return null
  return (
    <>
      <Card>
        <StyledContainer>
          <CardContent>
            <StyledTitle>Your Transactions</StyledTitle>
            <Spacer />
            {Object.keys(txs).map((hash, i) => (
              <li key={i}>
                <span>{txs[hash].addedTime}</span>
                <span>{txs[hash].hash}</span>
                {!txs[hash].receipt ? (
                  <span>Pending...</span>
                ) : (
                  <span>Confirmed</span>
                )}
              </li>
            ))}
          </CardContent>
        </StyledContainer>
      </Card>
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
