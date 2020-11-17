import React from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Spacer from '@/components/Spacer'

import formatBalance from '@/utils/formatBalance'

export interface LineItemProps {
  label: React.ReactNode
  data: string | number | any
  units?: any
}

const LineItem: React.FC<LineItemProps> = ({ label, data, units }) => {
  const sign = units
    ? units !== ''
      ? units.toString().charAt(0) === '-'
        ? '-'
        : units.toString().charAt(0) === '+'
        ? '+'
        : null
      : null
    : null
  const currency = units
    ? typeof units === 'string'
      ? sign === '+' || sign === '-'
        ? units.toString().slice(2)
        : units.toString()
      : null
    : null
  return (
    <StyledLineItem row justifyContent="space-between" alignItems="center">
      <StyledLabel>{label}</StyledLabel>
      <span>
        {sign}
        {currency === '$' ? currency : null} {data}{' '}
        {currency !== '$' ? currency : null}
      </span>
    </StyledLineItem>
  )
}

const StyledLabel = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  flex: 1;
  letter-spacing: 1px;
  opacity: 0.66;
  font-size: 14px;
  text-transform: uppercase;
`

const StyledLineItem = styled(Box)`
  width: 100%;
`

export default LineItem
