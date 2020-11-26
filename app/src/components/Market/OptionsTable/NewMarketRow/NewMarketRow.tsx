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
          Add a New Option Market
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
  cursor: pointer;
  font-weight: inherit;
  color: ${(props) => props.theme.color.white};
  margin-right: ${(props) => props.theme.spacing[2]}px;
  width: 40%;
`

export default NewMarketRow
