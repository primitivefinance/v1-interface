import React from 'react'
import styled from 'styled-components'
import {
  NAME_FOR_SPECIFICATION,
  DESCRIPTION_FOR_SPECIFICATION,
  SPECIFICATIONS,
} from '@/constants/specifications'
import { Grid, Col, Row } from 'react-styled-flexboxgrid'

import IconButton from '@/components/IconButton'
import Button from '@/components/Button'
import Tooltip from '@/components/Tooltip'
import Box from '@/components/Box'
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
import TableCell from '@/components/TableCell'
import TableRow from '@/components/TableRow'
import LitContainer from '@/components/LitContainer'
import Spacer from '@/components/Spacer'

const FaqTable: React.FC = () => {
  const headers = [
    {
      name: 'Contract Specifications',
    },
    {
      name: 'Description',
    },
  ]
  return (
    <StyledFAQ>
      <Spacer />
      <Spacer />
      <StyledTitle>Frequently Asked Questions</StyledTitle>
      <Spacer />
      <Spacer />
      <StyledTableBody>
        <Spacer size="sm" />
        {SPECIFICATIONS.map((specification, i) => {
          return (
            <>
              <TableRow key={i} isHead align="top" height={84}>
                <TableCell>
                  <StyledName>{specification.name}</StyledName>
                </TableCell>
                <TableCell>
                  <StyledSub>{specification.description}</StyledSub>
                </TableCell>
              </TableRow>
              <StyledDivLight />
              <Spacer size="sm" />
            </>
          )
        })}
      </StyledTableBody>
      <Spacer />
      <Spacer />
    </StyledFAQ>
  )
}

const StyledDiv = styled.div`
  border: 1px solid ${(props) => props.theme.color.grey[600]};
`

const StyledDivLight = styled.div`
  border: 1px solid ${(props) => props.theme.color.grey[800]};
`

const StyledTableBody = styled(TableBody)`
  width: 100%;
`
const StyledSub = styled.span`
  color: white;
  opacity: 0.66;
`
const StyledName = styled.span`
  color: white;
  font-weight: bold;
`
const StyledTitle = styled.div`
  color: white;
  font-weight: bold;
  font-size: 36px;
`
const StyledFAQ = styled.div`
  align-items: left;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
  max-width: 1000px;
  margin: 0 2em 0 2em;
`
export default FaqTable
