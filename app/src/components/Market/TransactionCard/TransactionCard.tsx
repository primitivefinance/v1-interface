import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import Spacer from '@/components/Spacer'
import Loader from '@/components/Loader'
import LaunchIcon from '@material-ui/icons/Launch'
import useTransactions from '@/hooks/transactions'
import { useWeb3React } from '@web3-react/core'

import { nullState } from '@/contexts/Transactions/types'

const ETHERSCAN_MAINNET = 'https://etherscan.io/address/'
const ETHERSCAN_RINKEBY = 'https://rinkeby.etherscan.io/address/'

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
            <Box row>
              <StyledTitle>Recent Transactions</StyledTitle>
              <Button variant="tertiary">clear</Button>
            </Box>
            <Spacer />
            {Object.keys(txs).map((hash, i) => {
              const date = new Date(txs[hash].addedTime * 1000)
              return (
                <li key={i}>
                  <Box row justifyContent="flex-start" alignItems="center">
                    <StyledText>
                      {date.getHours + `:` + date.getMinutes}
                    </StyledText>
                    <StyledLink
                      href={`${
                        chainId === 4 ? ETHERSCAN_MAINNET : ETHERSCAN_RINKEBY
                      } + ${txs[hash].hash}`}
                      target="__blank"
                    >
                      {txs[hash].hash.substr(0, 3)}
                    </StyledLink>
                    {!txs[hash].receipt ? (
                      <Loader />
                    ) : (
                      <StyledText>Confirmed</StyledText>
                    )}
                  </Box>
                </li>
              )
            })}
          </CardContent>
        </StyledContainer>
      </Card>
    </>
  )
}

const StyledText = styled.h5`
  align-items: center;
  color: ${(props) => props.theme.color.white};
  display: flex;
`

const StyledLink = styled.a`
  text-decoration: none;
  color: ${(props) => props.theme.color.white};
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
