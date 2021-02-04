import React from 'react'
import styled from 'styled-components'

const TableCell: React.FC = (props) => {
  return <StyledTableCell>{props.children}</StyledTableCell>
}

const StyledTableCell = styled.div`
  color: inherit;
  flex: 1;
  display: block;
  position: inherit;
`

export default TableCell
