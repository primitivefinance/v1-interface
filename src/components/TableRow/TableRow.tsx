import React from 'react'
import styled from 'styled-components'

export interface TableRowProps {
  isHead?: boolean
  onClick?: any
  isActive?: boolean
  height?: number
  align?: string
  isNav?: boolean
}

const TableRow: React.FC<TableRowProps> = (props) => {
  return (
    <StyledTableRow
      onClick={props.onClick}
      isActive={props.isActive}
      isHead={props.isHead}
      height={props.height}
      align={props.align}
      isNav={props.isNav}
    >
      {props.children}
    </StyledTableRow>
  )
}

interface StyleProps {
  isHead?: boolean
  isActive?: boolean
  height?: number
  align?: string
  isNav?: boolean
}

const StyledTableRow = styled.div<StyleProps>`
  position: relative;
  align-items: ${(props) => (props.align === 'top' ? null : 'center')};
  background-color: ${(props) =>
    props.isActive ? 'transparent' : 'transparent'};
  border-bottom: 1px solid
    ${(props) => (props.isHead ? 'transparent' : props.theme.color.grey[800])};
  color: ${(props) =>
    props.isHead ? props.theme.color.grey[400] : props.theme.color.white};
  cursor: ${(props) => (props.isHead ? null : 'pointer')};
  text-transform: ${(props) => (props.isHead ? 'uppercase' : 'inital')};
  font-size: ${(props) => (props.isHead ? '12px' : 'intital')};
  letter-spacing: ${(props) => (props.isHead ? '1px' : 'intital')};
  margin-bottom: ${(props) => (props.isHead ? '-1em' : 'inital')};
  display: flex;
  height: ${(props) => (props.height ? props.height : props.theme.rowHeight)}px;
  margin-left: -${(props) => props.theme.spacing[4]}px;
  padding-left: ${(props) => props.theme.spacing[4]}px;
  padding-right: ${(props) => props.theme.spacing[4]}px;
  pointer-events: all;
  &:hover {
    background-color: ${(props) =>
      props.isHead ? 'transparent' : props.theme.color.grey[800]};
    color: ${(props) =>
      props.isHead ? props.theme.color[400] : props.theme.color.white};
    //font-weight: ${(props) => (props.isHead ? '400' : '600')};
  }
`

export default TableRow
