import React, { useEffect } from 'react'
import styled from 'styled-components'

import LitContainer from '../../../../components/LitContainer'

import usePrices from '../../../../hooks/usePrices'

export interface PositionsHeaderProps {
  name: string
  symbol: string
}

const PositionsHeader: React.FC<PositionsHeaderProps> = (props) => {
  const { name } = props
  const { getPrices } = usePrices()

  useEffect(() => {
    getPrices(name.toLowerCase())
  }, [name, getPrices])

  return (
    <StyledHeader>
      <LitContainer>
        <StyledTitle>
          <StyledName>Open Positions</StyledName>
        </StyledTitle>
      </LitContainer>
    </StyledHeader>
  )
}

const StyledHeader = styled.div`
  background-color: ${(props) => props.theme.color.grey[800]};
  padding-bottom: ${(props) => props.theme.spacing[4]}px;
  padding-top: ${(props) => props.theme.spacing[4]}px;
`

const StyledTitle = styled.div`
  align-items: baseline;
  display: flex;
  margin-top: ${(props) => props.theme.spacing[2]}px;
`

const StyledName = styled.span`
  font-size: 24px;
  font-weight: 700;
  margin-right: ${(props) => props.theme.spacing[2]}px;
`

export default PositionsHeader
