import React from 'react'
import styled from 'styled-components'

const TableCell: React.FC = (props) => {
  return <StyledTableCell>{props.children}</StyledTableCell>
}

const StyledTableCell = styled.div`
  color: ${(props) => props.theme.color.white};
  flex: 1;
`

export default TableCell
