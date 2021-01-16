import React from 'react'
import styled from 'styled-components'

import Spacer from '@/components/Spacer'
import TableCell from '@/components/TableCell'
import Tooltip from '@/components/Tooltip'
import TableRow from '@/components/TableRow'
import Button from '@/components/Button'

import {
  LiquidityTableContainer,
  LiquidityTableContent,
} from '../../LiquidityTable'

export const headers = [
  {
    name: 'Strike',
    tip: 'The purchase price for the underlying asset of this option.',
  },
  {
    name: 'Share',
    tip:
      'The price the underlying asset must reach to reach a net cost of zero.',
  },
  {
    name: 'Asset 1',
    tip:
      'The current spot price of an option token willing to be purchased at.',
  },
  {
    name: 'Asset 2',
    tip: 'The current spot price of an option token willing to be sold at.',
  },
  {
    name: 'Fees',
    tip: 'The profit or loss of the position.',
  },
  { name: 'Liquidity', tip: 'The quantity of tokens in the pool.' },
  { name: 'Expiry', tip: 'The maturity date of the option token.' },
  { name: '', tip: null },
]

const LiquidityTableHeader: React.FC = () => {
  return (
    <StyledTableHead>
      <LiquidityTableContainer>
        <LiquidityTableContent>
          <TableRow isHead>
            {headers.map((header, index) => {
              if (index === headers.length - 1) {
                return (
                  <>
                    <TableCell></TableCell>
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
        </LiquidityTableContent>
      </LiquidityTableContainer>
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

export default LiquidityTableHeader
