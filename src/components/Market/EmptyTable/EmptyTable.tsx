import React from 'react'
import styled, { keyframes } from 'styled-components'

import TableBody from '../../TableBody'
import TableRow from '../../TableRow'
import TableCell from '../../TableCell'

export interface EmptyTableProps {
  columns: Array<any>
}

const EmptyTable: React.FC<EmptyTableProps> = (props) => {
  return (
    <TableBody>
      <TableRow>
        {props.columns.map((column, index) => {
          if (index === props.columns.length - 1) {
            return (
              <StyledButtonCell key={index}>
                <StyledLoadingBlock />
              </StyledButtonCell>
            )
          }
          return (
            <TableCell key={index}>
              <StyledLoadingBlock />
            </TableCell>
          )
        })}
      </TableRow>
    </TableBody>
  )
}

const changeColorWhileLoading = (color) => keyframes`
  0%   {background-color: ${color.grey[400]};}
  50%  {background-color: ${color.grey[500]};}
  100%  {background-color: ${color.grey[400]};}
`

const StyledLoadingBlock = styled.div`
  background-color: ${(props) => props.theme.color.grey[600]};
  width: 60px;
  height: 24px;
  border-radius: 12px;
  animation: ${(props) => changeColorWhileLoading(props.theme.color)} 2s linear
    infinite;
`

const StyledButtonCell = styled.div`
  width: ${(props) => props.theme.buttonSize}px;
  margin-right: ${(props) => props.theme.spacing[2]}px;
  flex: 0.5;
`

export default EmptyTable
