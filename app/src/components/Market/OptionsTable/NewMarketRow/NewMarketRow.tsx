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
      <TableRow isActive onClick={onClick}>
        <TableCell></TableCell>
        <StyledButtonCellError key={'Open'}>
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
  font-weight: inherit;
  display: flex;
  flex: 1;
  color: ${(props) => props.theme.color.white};
  margin-right: ${(props) => props.theme.spacing[2]}px;
  width: ${(props) => props.theme.buttonSize}px;
`

export default NewMarketRow
