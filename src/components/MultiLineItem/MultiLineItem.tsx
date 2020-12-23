import React from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Spacer from '@/components/Spacer'

import formatBalance from '@/utils/formatBalance'

export interface MultiLineItemProps {
  label: React.ReactNode
}

const MultiLineItem: React.FC<MultiLineItemProps> = ({ label, children }) => {
  return (
    <StyledMultiLineItem>
      <StyledLabel>{label}</StyledLabel>
      <Spacer />
      <span>{children}</span>
    </StyledMultiLineItem>
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

const StyledMultiLineItem = styled(Box)`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`

export default MultiLineItem
