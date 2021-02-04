import React from 'react'
import styled from 'styled-components'

const TableCell: React.FC = (props) => {
  return <StyledTableCell>{props.children}</StyledTableCell>
}

const StyledTableCell = styled.div`
  width: 100% !important;
  color: inherit;
  flex: 1;
  display: block !important;
  position: static !important;
`

export default TableCell
