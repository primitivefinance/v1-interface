import React from 'react'
import styled from 'styled-components'

const TableBody: React.FC = (props) => {
  return <StyledTableBody>{props.children}</StyledTableBody>
}

const StyledTableBody = styled.div`
  positoin: inital;
  display: block;
  width: inherit;
`

export default TableBody
