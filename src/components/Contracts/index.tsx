import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import {
  NAME_FOR_CONTRACT,
  ADDRESS_FOR_CONTRACT,
  RECEIPT_FOR_CONTRACT,
  AUDIT_FOR_CONTRACT,
  CONTRACTS,
} from '@/constants/contracts'
import { ETHERSCAN_MAINNET } from '@/constants/index'
import { Grid, Col, Row } from 'react-styled-flexboxgrid'
import CheckIcon from '@material-ui/icons/Check'
import LaunchIcon from '@material-ui/icons/Launch'
import WarningIcon from '@material-ui/icons/Warning'

import IconButton from '@/components/IconButton'
import Button from '@/components/Button'
import Tooltip from '@/components/Tooltip'
import Box from '@/components/Box'
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
import TableCell from '@/components/TableCell'
import TableRow from '@/components/TableRow'
import LitContainer from '@/components/LitContainer'
import Spacer from '@/components/Spacer'

const Contracts: React.FC = () => {
  const headers = [
    {
      name: 'Name',
    },
    {
      name: 'Address',
    },
    {
      name: 'Audit',
    },
  ]
  return (
    <>
      <StyledTitle>Deployed Contracts</StyledTitle>
      <Spacer />
      <LitContainer>
        <StyledTableBody>
          <TableRow isHead>
            {headers.map((header, index) => {
              return <TableCell key={header.name}>{header.name}</TableCell>
            })}
          </TableRow>
          <StyledDiv />
          <Spacer size="sm" />
          {CONTRACTS.map((contract, i) => {
            return (
              <TableRow key={i} isHead>
                <TableCell>
                  <StyledSub>{contract.name}</StyledSub>
                </TableCell>
                <TableCell>
                  <StyledARef
                    href={`https://etherscan.io/address/${contract.address}`}
                    target="__blank"
                  >
                    {contract.address.substr(0, 12)}
                    {'... '}
                    <LaunchIcon style={{ fontSize: '14px' }} />
                  </StyledARef>
                </TableCell>
                <TableCell>
                  <StyledLink
                    target="__none"
                    href={contract.audit !== 'N/A' ? contract.audit : null}
                  >
                    <IconButton variant="tertiary">
                      {contract.audit !== 'N/A' ? (
                        <CheckIcon style={{ color: 'green' }} />
                      ) : (
                        <Tooltip
                          icon={false}
                          text="This contract is awaiting audit"
                        >
                          <WarningIcon style={{ color: 'yellow' }} />
                        </Tooltip>
                      )}
                    </IconButton>
                  </StyledLink>
                </TableCell>
              </TableRow>
            )
          })}
        </StyledTableBody>
        <Spacer />
        <Spacer />
      </LitContainer>
    </>
  )
}

const StyledDiv = styled.div`
  border: 1px solid ${(props) => props.theme.color.grey[600]};
`

const StyledTableBody = styled(TableBody)`
  width: 50em;
`
const StyledLink = styled.a`
  color: white;
  text-decoration: none;
  width: 30%;
`
const StyledSub = styled.h4`
  color: white;
`
const StyledCol = styled(Col)`
  margin: 0.5em;
  overflow: visible;
`
const StyledARef = styled.a`
  color: ${(props) => props.theme.color.grey[400]};
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.color.white};
  }
`
const StyledTitle = styled.h2`
  color: white;
  font-weight: bold;
`
export default Contracts
