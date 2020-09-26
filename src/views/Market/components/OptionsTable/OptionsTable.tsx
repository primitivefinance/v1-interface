import React, { useEffect } from 'react'
import styled, { keyframes } from 'styled-components'

import useOrders from '../../../../hooks/useOrders'
import useOptions from '../../../../hooks/useOptions'

import LaunchIcon from '@material-ui/icons/Launch'

import { useWeb3React } from '@web3-react/core'
import { formatAddress } from '../../../../utils'

import Button from 'components/Button'
import LitContainer from '../../../../components/LitContainer'
import Table from '../../../../components/Table'
import TableBody from '../../../../components/TableBody'
import TableCell from '../../../../components/TableCell'
import TableRow from '../../../../components/TableRow'

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
  const headers = ['Strike Price', 'Break Even', 'Price', 'Contract', 'Choose']

  return (
    <Table>
      <StyledTableHead>
        <LitContainer>
          <TableRow isHead>
            {headers.map((header, index) => {
              if (index === headers.length - 1) {
                return <StyledButtonCell>{header}</StyledButtonCell>
              }
              return <TableCell>{header}</TableCell>
            })}
          </TableRow>
        </LitContainer>
      </StyledTableHead>
      <LitContainer>
        {options[type].length > 1 ? (
          <TableBody>
            {options[type].map((option, i) => {
              const { breakEven, price, strike, address } = option
              return (
                <TableRow key={address}>
                  <TableCell>${strike.toFixed(2)}</TableCell>
                  <TableCell>${breakEven.toFixed(2)}</TableCell>
                  <TableCell>${price.toFixed(2)}</TableCell>
                  <TableCell>
                    <StyledARef href={`${baseUrl}/${address}`}>
                      {formatAddress(address)}{' '}
                      <LaunchIcon style={{ fontSize: '14px' }} />
                    </StyledARef>
                  </TableCell>
                  <StyledButtonCell>
                    <Button
                      onClick={() => {
                        onAddItem(option, {
                          buyOrMint: true,
                        })
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      {'Open'}
                    </Button>
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

interface EmptyTableProps {
  columns: Array<any>
}

const EmptyTable: React.FC<EmptyTableProps> = (props) => {
  return (
    <TableBody>
      <TableRow>
        {props.columns.map((column, index) => {
          if (index == props.columns.length - 1) {
            return (
              <StyledButtonCell>
                <StyledLoadingBlock />
              </StyledButtonCell>
            )
          }
          return (
            <TableCell>
              <StyledLoadingBlock />
            </TableCell>
          )
        })}
      </TableRow>
    </TableBody>
  )
}

const StyledARef = styled.a`
  text-decoration: none;
  color: ${(props) => props.theme.color.white};
`

const StyledTableHead = styled.div`
  background-color: ${(props) => props.theme.color.grey[800]};
  border-bottom: 1px solid ${(props) => props.theme.color.grey[600]};
`

const changeColorWhileLoading = (color) => keyframes`
  0%   {background-color: ${color.grey[400]};}
  25%  {background-color: ${color.grey[500]};}
  50%  {background-color: ${color.grey[400]};}
  100% {background-color: ${color.grey[500]};}
`

const StyledLoadingBlock = styled.div`
  background-color: ${(props) => props.theme.color.grey[600]};
  width: 60px;
  height: 24px;
  border-radius: 12px;
  animation: ${(props) => changeColorWhileLoading(props.theme.color)} 2s linear
    infinite;
`

const StyledButtonCell = styled.div`
  width: ${(props) => props.theme.buttonSize}px;
  margin-right: ${(props) => props.theme.spacing[2]}px;
  flex: 0.5;
`

export default OptionsTable
