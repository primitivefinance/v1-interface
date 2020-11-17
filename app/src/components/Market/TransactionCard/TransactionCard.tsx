import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import IconButton from '@/components/Button'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import Table from '@/components/Table'
import TableRow from '@/components/TableRow'
import TableBody from '@/components/TableBody'
import Spacer from '@/components/Spacer'
import Loader from '@/components/Loader'
import LaunchIcon from '@material-ui/icons/Launch'

import { useWeb3React } from '@web3-react/core'
import ClearIcon from '@material-ui/icons/Clear'

import LitContainer from '@/components/LitContainer'
import TableCell from '@/components/TableCell'

import {
  useAllTransactions,
  useClearTransactions,
} from '@/state/transactions/hooks'

const ETHERSCAN_MAINNET = 'https://etherscan.io/tx/'
const ETHERSCAN_RINKEBY = 'https://rinkeby.etherscan.io/tx/'

const TransactionCard: React.FC = () => {
  const txs = useAllTransactions()
  const clearAll = useClearTransactions()
  const { library, chainId } = useWeb3React()
  const clear = () => {
    clearAll()
  }

  if (!txs) return null
  if (Object.keys(txs).length === 0 && txs.constructor === Object) return null
  return (
    <>
      <Card border>
        <CardTitle>
          <Box row justifyContent="space-around" alignItems="center">
            <StyledTitle>Recent Transactions</StyledTitle>
            <IconButton variant="transparent" size="sm" onClick={() => clear()}>
              <ClearIcon />
            </IconButton>
          </Box>
        </CardTitle>
        <div style={{ marginTop: '-1em' }} />
        <CardContent>
          <StyledContainer>
            <Table>
              <TableRow isHead>
                <TableCell>Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Hash</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
              <div style={{ marginTop: '-1em' }} />
              {Object.keys(txs)
                .reverse()
                .map((hash, i) => {
                  const date = new Date(txs[hash].confirmedTime)
                  return (
                    <StyledTableRow isHead key={i}>
                      <TableCell>
                        {!txs[hash].receipt ? (
                          <Loader size="sm" />
                        ) : (
                          <StyledDate>
                            {date.toUTCString().substr(16, 10)}
                          </StyledDate>
                        )}
                      </TableCell>
                      <TableCell>
                        {txs[hash].summary ? (
                          <StyledText>{txs[hash].summary.type}</StyledText>
                        ) : !txs[hash].approval.tokenAddress ? null : (
                          <StyledText>APPROVAL</StyledText>
                        )}
                      </TableCell>
                      <TableCell>
                        <StyledLink
                          href={`${
                            chainId !== 4
                              ? ETHERSCAN_MAINNET
                              : ETHERSCAN_RINKEBY
                          }${txs[hash].hash}`}
                          target="__blank"
                        >
                          <Box
                            row
                            justifyContent="flex-start"
                            alignItems="center"
                          >
                            {txs[hash].hash.substr(0, 4)}...
                            <LaunchIcon style={{ fontSize: '14px' }} />
                          </Box>
                        </StyledLink>
                      </TableCell>
                      <TableCell>
                        {!txs[hash].receipt ? (
                          <StyledPending>Pending</StyledPending>
                        ) : (
                          <StyledConfirmed>Confirmed</StyledConfirmed>
                        )}
                      </TableCell>
                    </StyledTableRow>
                  )
                })}
            </Table>
          </StyledContainer>
          <div style={{ marginTop: '-1em' }} />
        </CardContent>
      </Card>
    </>
  )
}

const Reverse = styled.div`
  margin-top: -1.1em;
`

const StyledContainer = styled.div`
  width: 110%;
  justify-content: space-around;
  padding-left: 0.5em;
`

const StyledTableHead = styled.div`
  background-color: ${(props) => props.theme.color.grey[800]};
  border-bottom: 1px solid ${(props) => props.theme.color.grey[600]};
`

const StyledTableRow = styled(TableRow)`
  background-color: ${(props) => props.theme.color.black};
  width: 100%;
`
const StyledText = styled.h6`
  align-items: center;
  color: ${(props) => props.theme.color.white};
  display: flex;
`
const StyledDate = styled.h5`
  align-items: center;
  color: ${(props) => props.theme.color.white};
  display: flex;
`
const StyledTitle = styled(Box)`
  align-items: center;
  display: flex;
  flex-direction: row;
  min-width: 15.7em;
  width: 100%;
`

const StyledConfirmed = styled.h5`
  align-items: center;
  color: ${(props) => props.theme.color.green[500]};
  display: flex;
`
const StyledPending = styled.h5`
  align-items: center;
  color: ${(props) => props.theme.color.red[500]};
  display: flex;
`
const StyledLink = styled.a`
  text-decoration: none;
  color: ${(props) => props.theme.color.grey[400]};
`

export default TransactionCard
