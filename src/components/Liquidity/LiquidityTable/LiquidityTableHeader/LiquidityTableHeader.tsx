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
    name: 'Asset',
    tip:
      'The asset to deposit into the pool, represents the underlying asset of the option market.',
  },
  {
    name: 'Pool Size',
    tip: 'The amount of underlying tokens in the pool.',
  },
  {
    name: 'Your Share',
    tip: 'The proportion of ownership of the option pair.',
  },
  {
    name: 'Price',
    tip: 'The ask price of 1 option token.',
  },
  { name: 'Expiry', tip: 'The maturity date of the option token.' },
  {
    name: 'Strike',
    tip: 'The purchase price for the underlying asset of this option.',
  },

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
                    <TableCell>
                      <StyledButtonCell key={'Open'}>
                        <Spacer />
                      </StyledButtonCell>
                    </TableCell>
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
