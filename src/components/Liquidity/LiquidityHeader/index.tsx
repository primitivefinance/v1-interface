import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import GoBack from '@/components/GoBack'
import LitContainer from '@/components/LitContainer'
import Tooltip from '@/components/Tooltip'
import Spacer from '@/components/Spacer'
import Loader from '@/components/Loader'
import LaunchIcon from '@material-ui/icons/Launch'

import useSWR from 'swr'
import { useOptions } from '@/state/options/hooks'
import { useUpdatePrice } from '@/state/price/hooks'
import { useWeb3React } from '@web3-react/core'

import formatBalance from '@/utils/formatBalance'
import formatEtherBalance from '@/utils/formatEtherBalance'
import numeral from 'numeral'

import {
  COINGECKO_ID_FOR_MARKET,
  NAME_FOR_MARKET,
  ADDRESS_FOR_MARKET,
  ETHERSCAN_MAINNET,
  ETHERSCAN_RINKEBY,
  getIconForMarket,
} from '@/constants/index'

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
  const { library, chainId } = useWeb3React()
  const baseUrl = chainId === 1 ? ETHERSCAN_MAINNET : ETHERSCAN_RINKEBY

  return (
    <StyledHeader>
      <Spacer />
      <LitContainer>
        <StyledTitle>
          <StyledName>Liquidity Pools</StyledName>
          {isCall ? (
            <StyledSub>
              Supply call market pools with liquidity and earn option trading
              fees
            </StyledSub>
          ) : (
            <StyledSub>
              Supply put market pools with liquidity and earn option trading
              fees
            </StyledSub>
          )}
          <Spacer size="lg" />
          <Spacer size="lg" />
          <Spacer size="lg" />
          <Spacer size="md" />
          <Spacer size="sm" />
          <Spacer size="sm" />
          {children}
        </StyledTitle>
      </LitContainer>
      <Reverse />
    </StyledHeader>
  )
}
const Reverse = styled.div`
  margin-bottom: -1em;
`

const StyledL = styled(Box)`
  margin-top: -1.5em;
  margin-bottom: -1.1em;
`

const GreyBack = styled.div`
  background: ${(props) => props.theme.color.grey[800]};
  position: absolute;
  z-index: -100;
  min-height: 310px;
  min-width: 4500px;
  left: 0;
`
const StyledContent = styled(Box)`
  align-items: center;
  flex-direction: row;
  justify-content: flex-start;
  min-width: 8em;
  margin-right: 2em;
`
const StyledIcon = styled(LaunchIcon)`
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 14px !important;
  margin-left: 10px;
`
const StyledHeader = styled.div`
  padding-bottom: ${(props) => props.theme.spacing[4]}px;
  margin-left: 2em;
  margin-right: 2em;
  margin-top: -1em;
`

const StyledTitle = styled.div`
  align-items: center;
  flex-direction: row;
  color: ${(props) => props.theme.color.white};
  display: flex;
  margin-top: ${(props) => props.theme.spacing[2]}px;
  justify-content: space-between;
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
  min-width: 12em;
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
  min-width: 20em;
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
