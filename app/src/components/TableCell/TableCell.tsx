import React from 'react'
import styled from 'styled-components'

const TableCell: React.FC = (props) => {
  return <StyledTableCell>{props.children}</StyledTableCell>
}

const StyledTableCell = styled.div`
  flex: 1;
  color: ${(props) => props.theme.color.white};
`

export default TableCell
