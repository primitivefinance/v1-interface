import React, { useEffect } from 'react'
import styled from 'styled-components'

import EmptyTable from '../EmptyTable'
import LitContainer from '@/components/LitContainer'
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
import TableCell from '@/components/TableCell'
import TableRow from '@/components/TableRow'

import useOrders from '@/hooks/useOrders'
import useOptions from '@/hooks/useOptions'

import LaunchIcon from '@material-ui/icons/Launch'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'

import formatAddress from '@/utils/formatAddress'
import formatBalance from '@/utils/formatBalance'

import { useWeb3React } from '@web3-react/core'

export type FormattedOption = {
  breakEven: number
  change: number
  price: number
  strike: number
  volume: number
}

export interface OptionsTableProps {
  options: FormattedOption[]
  asset: string
  callActive: boolean
}

const ETHERSCAN_MAINNET = 'https://etherscan.io/address'
const ETHERSCAN_RINKEBY = 'https://rinkeby.etherscan.io/address'

const OptionsTable: React.FC<OptionsTableProps> = (props) => {
  const { callActive, asset } = props
  const { options, getOptions } = useOptions()
  const { onAddItem } = useOrders()
  const { library, chainId } = useWeb3React()

  useEffect(() => {
    if (library) {
      getOptions(asset.toLowerCase())
    }
  }, [library, asset, getOptions])

  const type = callActive ? 'calls' : 'puts'
  const baseUrl = chainId === 4 ? ETHERSCAN_RINKEBY : ETHERSCAN_MAINNET
  const headers = ['Strike Price', 'Break Even', 'Price', 'Contract', '']

  return (
    <Table>
      <StyledTableHead>
        <LitContainer>
          <TableRow isHead>
            {headers.map((header, index) => {
              if (index === headers.length - 1) {
                return (
                  <StyledButtonCell key={header}>{header}</StyledButtonCell>
                )
              }
              return <TableCell key={header}>{header}</TableCell>
            })}
          </TableRow>
        </LitContainer>
      </StyledTableHead>
      <LitContainer>
        {options[type].length > 1 ? (
          <TableBody>
            {options[type].map((option) => {
              const { breakEven, price, strike, address } = option
              return (
                <TableRow
                  key={address}
                  onClick={() => {
                    onAddItem(option, '')
                  }}
                >
                  <TableCell key={strike}>${formatBalance(strike)}</TableCell>
                  <TableCell key={breakEven}>
                    ${formatBalance(breakEven)}
                  </TableCell>
                  <TableCell key={price}>${formatBalance(price)}</TableCell>
                  <TableCell key={address}>
                    <StyledARef href={`${baseUrl}/${address}`}>
                      {formatAddress(address)}{' '}
                      <LaunchIcon style={{ fontSize: '14px' }} />
                    </StyledARef>
                  </TableCell>
                  <StyledButtonCell key={'Open'}>
                    <ArrowForwardIosIcon />
                  </StyledButtonCell>
                </TableRow>
              )
            })}
          </TableBody>
        ) : (
          <>
            <EmptyTable columns={headers} />
            <EmptyTable columns={headers} />
            <EmptyTable columns={headers} />
          </>
        )}
      </LitContainer>
    </Table>
  )
}

const StyledARef = styled.a`
  color: ${(props) => props.theme.color.white};
  text-decoration: none;
`

const StyledTableHead = styled.div`
  background-color: ${(props) => props.theme.color.grey[800]};
  border-bottom: 1px solid ${(props) => props.theme.color.grey[600]};
`

const StyledButtonCell = styled.div`
  font-weight: inherit;
  flex: 0.25;
  margin-right: ${(props) => props.theme.spacing[2]}px;
  width: ${(props) => props.theme.buttonSize}px;
`

export default OptionsTable
