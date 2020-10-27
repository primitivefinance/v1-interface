import React from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Spacer from '@/components/Spacer'

import formatBalance from '@/utils/formatBalance'

export interface LineItemProps {
  label: React.ReactNode
  data: string | number
  units?: React.ReactNode
}

const LineItem: React.FC<LineItemProps> = ({ label, data, units }) => {
  return (
    <StyledLineItem>
      <StyledLabel>{label}</StyledLabel>
      <Spacer />
      <span>
        {units ? units : null} {formatBalance(data)}
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
  text-transform: uppercase;
`

const StyledLineItem = styled(Box)`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`

export default LineItem
