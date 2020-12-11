import React, { useEffect, useMemo, useCallback, useState } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import IconButton from '@/components/Button'
import Button from '@/components/Button'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import Tooltip from '@/components/Tooltip'
import Table from '@/components/Table'
import TableRow from '@/components/TableRow'
import TableBody from '@/components/TableBody'
import Spacer from '@/components/Spacer'
import Loader from '@/components/Loader'
import LaunchIcon from '@material-ui/icons/Launch'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import { useWeb3React } from '@web3-react/core'
import ClearIcon from '@material-ui/icons/Clear'
import LitContainer from '@/components/LitContainer'
import TableCell from '@/components/TableCell'

import {
  useAllTransactions,
  useClearTransactions,
} from '@/state/transactions/hooks'
import { useClickAway } from '@/hooks/utils/useClickAway'

const ETHERSCAN_MAINNET = 'https://etherscan.io/tx/'
const ETHERSCAN_RINKEBY = 'https://rinkeby.etherscan.io/tx/'

const TransactionCard: React.FC = () => {
  const txs = useAllTransactions()
  const clearAll = useClearTransactions()
  const { library, chainId } = useWeb3React()
  const [open, setOpen] = useState(false)
  const [first, setFirst] = useState(null)

  const clear = () => {
    clearAll()
  }
  const nodeRef = useClickAway(() => {
    setOpen(false)
  })

  useEffect(() => {
    if (txs) {
      Object.keys(txs).map((hash, i) => {
        setFirst(hash)
      })
    }
  }, [txs, setFirst])
  if (!txs) return null

  if (Object.keys(txs).length === 0 && txs.constructor === Object) return null
  return (
    <div ref={nodeRef}>
      <Card border>
        <Spacer size="sm" />
        <CardTitle>
          <div onClick={() => setOpen(!open)}>
            <StyledBox row justifyContent="space-between" alignItems="center">
              <StyledTitle>
                Recent Transactions
                <Spacer />
                {txs[first]?.receipt ? null : <Loader size="sm" />}
              </StyledTitle>
              <Spacer />
              {!open ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </StyledBox>
          </div>
        </CardTitle>
        <Spacer size="sm" />
        {open ? (
          <CardContent>
            <Button variant="secondary" onClick={() => clear()}>
              Clear All
            </Button>
            <StyledContainer>
              <Table>
                <TableRow isHead>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Hash</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
                <div style={{ marginTop: '-1em' }} />
                <Scroll>
                  {Object.keys(txs)
                    .reverse()
                    .map((hash, i) => {
                      const date = new Date(txs[hash].confirmedTime)
                      const start = new Date(txs[hash].addedTime)
                      return (
                        <StyledTableRow isHead key={i}>
                          <TableCell>
                            {!txs[hash].receipt ? (
                              <StyledDate>
                                {start.toUTCString().substr(16, 10)}
                              </StyledDate>
                            ) : (
                              <StyledDate>
                                {date.toUTCString().substr(16, 10)}
                              </StyledDate>
                            )}
                          </TableCell>
                          <TableCell>
                            {txs[hash].summary ? (
                              <StyledText>
                                {txs[hash].summary.type.substr(0, 8)}
                              </StyledText>
                            ) : !txs[hash].approval.tokenAddress ? null : (
                              <StyledText>APPROVE</StyledText>
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
                </Scroll>
              </Table>
            </StyledContainer>
            <div style={{ marginTop: '-1em' }} />
          </CardContent>
        ) : null}
        <Spacer size="sm" />
      </Card>
    </div>
  )
}

const Scroll = styled.div`
  overflow-y: scroll;
  max-height: 13em;
`
const StyledBox = styled(Box)`
  cursor: pointer;
  color: ${(props) => props.theme.color.grey[400]};
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
  min-width: 16em;
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
  &: hover {
    color: ${(props) => props.theme.color.white};
  }
`

export default TransactionCard
