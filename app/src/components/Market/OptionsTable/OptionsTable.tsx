import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import EmptyTable from '../EmptyTable'
import Spacer from '@/components/Spacer'
import LitContainer from '@/components/LitContainer'
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
import TableCell from '@/components/TableCell'
import TableRow from '@/components/TableRow'

import useOrders from '@/hooks/useOrders'
import useOptions from '@/hooks/useOptions'

import LaunchIcon from '@material-ui/icons/Launch'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import AddIcon from '@material-ui/icons/Add'
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
  optionExp: number
  asset: string
  assetAddress: string
  callActive: boolean
}

const ETHERSCAN_MAINNET = 'https://etherscan.io/address'
const ETHERSCAN_RINKEBY = 'https://rinkeby.etherscan.io/address'

const OptionsTable: React.FC<OptionsTableProps> = (props) => {
  const { callActive, asset, assetAddress, optionExp } = props
  const { options, getOptions } = useOptions()
  const { onAddItem, item } = useOrders()
  const { library, chainId } = useWeb3React()
  useEffect(() => {
    if (library) {
      if (asset === 'eth') {
        getOptions('WETH')
      } else {
        getOptions(asset.toLowerCase().substr(0, 3))
      }
    }
  }, [library, asset, getOptions])

  const type = callActive ? 'calls' : 'puts'
  const baseUrl = chainId === 4 ? ETHERSCAN_RINKEBY : ETHERSCAN_MAINNET
  const headers = [
    'Strike Price',
    'Break Even',
    'Price',
    'Long Reserve',
    'Short Reserve',
    'Contract',
    '',
  ]
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
        {options[type].length >= 0 ? (
          <TableBody>
            {options[type].map((option) => {
              const {
                breakEven,
                price,
                strike,
                reserve,
                address,
                expiry,
              } = option
              if (optionExp != expiry && expiry === 0) return null
              return (
                <TableRow
                  key={address}
                  onClick={() => {
                    onAddItem(option, '')
                  }}
                >
                  <TableCell key={strike.toString()}>
                    ${formatBalance(strike)}
                  </TableCell>
                  <TableCell key={breakEven}>
                    ${formatBalance(breakEven)}
                  </TableCell>
                  <TableCell key={price}>${formatBalance(price)}</TableCell>
                  <TableCell key={reserve}>{formatBalance(reserve)}</TableCell>
                  <TableCell key={reserve}>{formatBalance(reserve)}</TableCell>
                  <TableCell key={address}>
                    <StyledARef href={`${baseUrl}/${option.address}`}>
                      {formatAddress(option.address)}{' '}
                      <LaunchIcon style={{ fontSize: '14px' }} />
                    </StyledARef>
                  </TableCell>
                  <StyledButtonCell key={'Open'}>
                    <ArrowForwardIosIcon />
                  </StyledButtonCell>
                </TableRow>
              )
            })}
            <TableRow
              isActive
              onClick={() => {
                onAddItem(
                  {
                    expiry: optionExp,
                    asset: asset,
                    tokenAddress: assetAddress,
                  },
                  ''
                )
              }}
            >
              <TableCell></TableCell>
              <StyledButtonCellError key={'Open'}>
                <AddIcon />
                <Spacer size="md" />
                Add a New Option Market
              </StyledButtonCellError>
              <TableCell></TableCell>
            </TableRow>
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

const StyledButtonCellError = styled.div`
  font-weight: inherit;
  display: flex;
  flex: 1;
  color: ${(props) => props.theme.color.white};
  margin-right: ${(props) => props.theme.spacing[2]}px;
  width: ${(props) => props.theme.buttonSize}px;
`

export default OptionsTable
