import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import TableRow from '@/components/TableRow'
import TableBody from '@/components/TableBody'
import Spacer from '@/components/Spacer'
import Loader from '@/components/Loader'
import LaunchIcon from '@material-ui/icons/Launch'

import useTransactions from '@/hooks/transactions'
import { useWeb3React } from '@web3-react/core'
import ClearIcon from '@material-ui/icons/Clear'

import { nullState } from '@/contexts/Transactions/types'
import LitContainer from '@/components/LitContainer'
import TableCell from '@/components/TableCell'

const ETHERSCAN_MAINNET = 'https://etherscan.io/tx/'
const ETHERSCAN_RINKEBY = 'https://rinkeby.etherscan.io/tx/'

const TransactionCard: React.FC = () => {
  const { transactions, clearAllTransactions } = useTransactions()
  const { library, chainId } = useWeb3React()

  const txs = transactions[chainId]
  const clear = () => {
    clearAllTransactions(chainId)
  }

  if (!txs) return null
  if (Object.keys(txs).length === 0 && txs.constructor === Object) return null
  return (
    <>
      <Card>
        <CardTitle>
          <StyledTitle>Recent Transactions</StyledTitle>
          <Button variant="transparent" size="sm" onClick={() => clear()}>
            <ClearIcon />
          </Button>
        </CardTitle>
        <CardContent>
          {Object.keys(txs).map((hash, i) => {
            const date = new Date(txs[hash].confirmedTime)
            return (
              <StyledTableRow isActive key={i}>
                <TableCell>
                  <Box row justifyContent="space-between" alignItems="center">
                    {!txs[hash].receipt ? (
                      <>Pending...</>
                    ) : (
                      <StyledText>
                        {date.toUTCString().substr(16, 10)}
                      </StyledText>
                    )}
                    <Spacer size="sm" />
                    {txs[hash].summary ? (
                      <StyledText>{txs[hash].summary}</StyledText>
                    ) : txs[hash].approval ? null : (
                      <StyledText>Token Approval</StyledText>
                    )}
                    <Spacer size="sm" />
                    <StyledLink
                      href={`${
                        chainId !== 4 ? ETHERSCAN_MAINNET : ETHERSCAN_RINKEBY
                      }${txs[hash].hash}`}
                      target="__blank"
                    >
                      <Box row justifyContent="center" alignItems="center">
                        {txs[hash].hash.substr(0, 8)}...
                        <LaunchIcon style={{ fontSize: '14px' }} />
                      </Box>
                    </StyledLink>

                    <Spacer />
                  </Box>
                </TableCell>
                {!txs[hash].receipt ? (
                  <Loader />
                ) : (
                  <StyledConfirmed>Confirmed</StyledConfirmed>
                )}
              </StyledTableRow>
            )
          })}
        </CardContent>
      </Card>
    </>
  )
}

const StyledTableRow = styled(TableRow)`
  width: 100%;
`
const StyledText = styled.h5`
  align-items: center;
  color: ${(props) => props.theme.color.white};
  display: flex;
`
const StyledTitle = styled(Box)`
  align-items: center;
  display: flex;
  flex-direction: row;
  width: 100%;
`

const StyledConfirmed = styled.h5`
  align-items: center;
  color: ${(props) => props.theme.color.green[500]};
  display: flex;
`
const StyledLink = styled.a`
  text-decoration: none;
  color: ${(props) => props.theme.color.grey[400]};
`

export default TransactionCard
