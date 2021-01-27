import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import Box from '@/components/Box'

const Description: React.FC = ({ children }) => {
  return (
    <StyledSummary column alignItems="flex-start">
      <PurchaseInfo>
        <StyledSpan>{children}</StyledSpan>
      </PurchaseInfo>
    </StyledSummary>
  )
}

const StyledSpan = styled.span`
  color: ${(props) => props.theme.color.grey[400]};
`

const StyledSummary = styled(Box)`
  display: flex;
  flex: 1;
  min-width: 100%;
  margin-bottom: ${(props) => props.theme.spacing[3]}px;
`

const PurchaseInfo = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
  vertical-align: middle;
  display: table;
  margin-bottom: -1em;
`

export default Description
