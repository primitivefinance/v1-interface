import React from 'react'
import styled from 'styled-components'

import Spacer from '@/components/Spacer'
import TableCell from '@/components/TableCell'
import Tooltip from '@/components/Tooltip'
import TableRow from '@/components/TableRow'
import LitContainer from '@/components/LitContainer'

const OptionsTableHeader: React.FC = () => {
  const headers = [
    {
      name: 'Strike',
      tip: 'The purchase price for the underlying asset of this option',
    },
    {
      name: 'Break-Even',
      tip:
        'The price the underlying asset must reach to reach a net cost of zero',
    },
    {
      name: 'Price',
      tip:
        'The current spot price of an option token, not accounting for slippage',
    },
    {
      name: 'Depth',
      tip: 'Slippage incurred for purchasing 2% of the underlying reserves',
    },
    { name: 'Liquidity', tip: 'The quantity of tokens in the pool' },
    { name: 'Contract', tip: 'The address of the Option token' },
    { name: '', tip: null },
  ]

  return (
    <StyledTableHead>
      <LitContainer>
        <TableRow isHead>
          {headers.map((header, index) => {
            if (index === headers.length - 1) {
              return (
                <>
                  <Spacer />
                  <Spacer size="sm" />
                  <Spacer size="sm" />
                  <Spacer size="sm" />
                </>
              )
            }
            if (header.tip) {
              return (
                <TableCell key={header.name}>
                  <Tooltip text={header.tip}>{header.name}</Tooltip>
                </TableCell>
              )
            }
            return <TableCell key={header.name}>{header.name}</TableCell>
          })}
        </TableRow>
        <GreyBack />
      </LitContainer>
    </StyledTableHead>
  )
}

const GreyBack = styled.div`
  background: ${(props) => props.theme.color.grey[800]};
  position: absolute;
  z-index: -100;
  min-height: 2px;
  min-width: 4000px;
  left: 0;
`

const StyledTableHead = styled.div`
  border-bottom: 0px solid ${(props) => props.theme.color.grey[600]};
`

const StyledButtonCell = styled.div`
  font-weight: inherit;
  flex: 0.25;
  margin-right: ${(props) => props.theme.spacing[2]}px;
  width: ${(props) => props.theme.buttonSize}px;
`

export default OptionsTableHeader
