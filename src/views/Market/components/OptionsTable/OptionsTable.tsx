import React, { useEffect } from 'react'
import styled from 'styled-components'

import useOrders from '../../../../hooks/useOrders'
import useOptions from '../../../../hooks/useOptions'

import AddIcon from '@material-ui/icons/Add'

import { useWeb3React } from '@web3-react/core'

import IconButton from '../../../../components/IconButton'
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

const OptionsTable: React.FC<OptionsTableProps> = (props) => {
  const { callActive, asset } = props
  const { options, getOptions } = useOptions()
  const { onAddItem } = useOrders()
  const { library } = useWeb3React()

  useEffect(() => {
    if (library) {
      getOptions(asset.toLowerCase())
    }
  }, [library, asset, getOptions])

  const type = callActive ? 'calls' : 'puts'

  return (
    <Table>
      <StyledTableHead>
        <LitContainer>
          <TableRow isHead>
            <TableCell>Strike Price</TableCell>
            <TableCell>Break Even</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Address</TableCell>
            <StyledButtonCell />
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
                  <TableCell>{address.substring(0, 6)}</TableCell>
                  <StyledButtonCell>
                    <IconButton
                      onClick={() => {
                        onAddItem(option, {
                          buyOrMint: true,
                        })
                      }}
                      variant="secondary"
                    >
                      <AddIcon />
                    </IconButton>
                  </StyledButtonCell>
                </TableRow>
              )
            })}
          </TableBody>
        ) : (
          <TableBody>
            <TableRow>
              <TableCell>
                <StyledLoadingBlock />
              </TableCell>
              <TableCell>
                <StyledLoadingBlock />
              </TableCell>
              <TableCell>
                <StyledLoadingBlock />
              </TableCell>
              <TableCell>
                <StyledLoadingBlock />
              </TableCell>
              <StyledButtonCell></StyledButtonCell>
            </TableRow>
          </TableBody>
        )}
      </LitContainer>
    </Table>
  )
}

const StyledTableHead = styled.div`
  background-color: ${(props) => props.theme.color.grey[800]};
  border-bottom: 1px solid ${(props) => props.theme.color.grey[600]};
`

const StyledLoadingBlock = styled.div`
  background-color: ${(props) => props.theme.color.grey[600]};
  width: 60px;
  height: 24px;
  border-radius: 12px;
`

const StyledButtonCell = styled.div`
  width: ${(props) => props.theme.buttonSize}px;
  margin-right: ${(props) => props.theme.spacing[2]}px;
`

export default OptionsTable
