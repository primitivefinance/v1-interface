import React, { useEffect } from 'react'
import styled from 'styled-components'

import useOrders from '../../../hooks/useOrders'
import useOptions from '../../../hooks/useOptions'

import LaunchIcon from '@material-ui/icons/Launch'

import { useWeb3React } from '@web3-react/core'
import { formatAddress } from '../../../utils'

import Button from '../../Button'
import EmptyTable from '../EmptyTable'
import LitContainer from '../../LitContainer'
import Table from '../../Table'
import TableBody from '../../TableBody'
import TableCell from '../../TableCell'
import TableRow from '../../TableRow'

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
            {options[type].map((option, i) => {
              const { breakEven, price, strike, address } = option
              return (
                <TableRow key={address}>
                  <TableCell key={strike}>${strike.toFixed(2)}</TableCell>
                  <TableCell key={breakEven}>${breakEven.toFixed(2)}</TableCell>
                  <TableCell key={price}>${price.toFixed(2)}</TableCell>
                  <TableCell key={address}>
                    <StyledARef href={`${baseUrl}/${address}`}>
                      {formatAddress(address)}{' '}
                      <LaunchIcon style={{ fontSize: '14px' }} />
                    </StyledARef>
                  </TableCell>
                  <StyledButtonCell key={'Open'}>
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

const StyledARef = styled.a`
  text-decoration: none;
  color: ${(props) => props.theme.color.white};
`

const StyledTableHead = styled.div`
  background-color: ${(props) => props.theme.color.grey[800]};
  border-bottom: 1px solid ${(props) => props.theme.color.grey[600]};
`

const StyledButtonCell = styled.div`
  width: ${(props) => props.theme.buttonSize}px;
  margin-right: ${(props) => props.theme.spacing[2]}px;
  flex: 0.5;
`

export default OptionsTable
