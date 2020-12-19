import React from 'react'
import styled from 'styled-components'
import TableCell from '@/components/TableCell'
import TableRow from '@/components/TableRow'
import AddIcon from '@material-ui/icons/Add'
import Spacer from '@/components/Spacer'

export interface NewMarketRowProps {
  onClick: () => void
}

const NewMarketRow: React.FC<NewMarketRowProps> = ({ onClick }) => {
  return (
    <>
      <TableRow isHead>
        <TableCell></TableCell>
        <StyledButtonCellError key={'Open'} onClick={onClick}>
          <AddIcon />
          <Spacer size="md" />
          Add Option Market
        </StyledButtonCellError>
        <TableCell></TableCell>
      </TableRow>
    </>
  )
}

const StyledButtonCellError = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-weight: inherit;
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 1px;
  color: ${(props) => props.theme.color.grey[400]};
  margin-right: ${(props) => props.theme.spacing[2]}px;
  width: 40%;
  &:hover {
    color: ${(props) => props.theme.color.white};
  }
`

export default NewMarketRow
