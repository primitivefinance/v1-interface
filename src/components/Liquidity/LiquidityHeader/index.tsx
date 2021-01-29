import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import LitContainer from '@/components/LitContainer'
import Tooltip from '@/components/Tooltip'
import Spacer from '@/components/Spacer'

export interface MarketHeaderProps {
  icons: any
  isCall: boolean
  children?: any
}

const LiquidityHeader: React.FC<MarketHeaderProps> = ({
  icons,
  isCall,
  children,
}) => {
  return (
    <StyledHeader>
      <Spacer />
      <StyledTitle>
        <StyledName>Liquidity Pools</StyledName>
        <Spacer />
        {children}
        <Spacer />
        <Spacer />
      </StyledTitle>
      <Reverse />
    </StyledHeader>
  )
}
const Reverse = styled.div`
  margin-bottom: -1em;
`

const StyledHeader = styled.div`
  padding-bottom: ${(props) => props.theme.spacing[4]}px;
  display: block;
  margin-left: -15em;
  margin-right: 1em;
  margin-top: -1em;
`

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  color: ${(props) => props.theme.color.white};
  margin-top: ${(props) => props.theme.spacing[2]}px;
  justify-content: flex-start;
`

const StyledName = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${(props) => props.theme.color.white};
  text-decoration: none;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 7em;
`
const StyledSub = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${(props) => props.theme.color.grey[400]};
  text-decoration: none;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 0.5em;
  min-width: 40em;
`

const StyledSymbol = styled.span`
  color: ${(props) => props.theme.color.grey[400]};
  letter-spacing: 1px;
  text-transform: uppercase;
`
const StyledLogo = styled.img`
  border-radius: 50%;
  height: 64px;
`

export default LiquidityHeader
