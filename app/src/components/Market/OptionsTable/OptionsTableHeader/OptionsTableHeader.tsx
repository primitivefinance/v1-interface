import React from 'react'
import styled from 'styled-components'
import TableCell from '@/components/TableCell'
import Tooltip from '@/components/Tooltip'
import TableRow from '@/components/TableRow'
import LitContainer from '@/components/LitContainer'

const OptionsTableHeader: React.FC = () => {
  const headers = [
    {
      name: 'Strike Price',
      tip: 'The purchase price for the underlying asset of this option.',
    },
    {
      name: 'Break Even',
      tip:
        'The price the underlying asset must reach to reach a net cost of zero.',
    },
    {
      name: 'Price',
      tip:
        'The current spot price of an option token, not accounting for slippage.',
    },
    { name: '2% Depth', tip: '# of options can be bought at <2% slippage' },
    { name: 'Reserve', tip: 'The quantity of tokens in the pool.' },
    { name: 'Contract', tip: 'The address of the Option token.' },
    { name: '', tip: null },
  ]

  return (
    <StyledTableHead>
      <LitContainer>
        <TableRow isHead>
          {headers.map((header, index) => {
            if (index === headers.length - 1) {
              return (
                <StyledButtonCell key={header.name}>
                  {header.tip}
                </StyledButtonCell>
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
      </LitContainer>
    </StyledTableHead>
  )
}
const StyledTableHead = styled.div`
  border-bottom: 1px solid ${(props) => props.theme.color.grey[600]};
`

const StyledButtonCell = styled.div`
  font-weight: inherit;
  flex: 0.25;
  margin-right: ${(props) => props.theme.spacing[2]}px;
  width: ${(props) => props.theme.buttonSize}px;
`

export default OptionsTableHeader
