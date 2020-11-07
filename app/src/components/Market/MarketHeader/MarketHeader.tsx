import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import GoBack from '@/components/GoBack'
import LitContainer from '@/components/LitContainer'
import Spacer from '@/components/Spacer'
import useSWR from 'swr'
import useOptions from '@/hooks/useOptions'
import { useWeb3React } from '@web3-react/core'

import formatBalance from '@/utils/formatBalance'

import {
  COINGECKO_ID_FOR_MARKET,
  NAME_FOR_MARKET,
  getIconForMarket,
} from '@/constants/index'

const formatName = (name: any) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export interface MarketHeaderProps {
  marketId: string
}

const MarketHeader: React.FC<MarketHeaderProps> = ({ marketId }) => {
  const prevPrice = useRef<number | null>(null)
  const [blink, setBlink] = useState(false)
  const { options, getOptions } = useOptions()
  const { library } = useWeb3React()

  const getMarketDetails = () => {
    let key: string
    let name: string
    const symbol: string = marketId
    name = NAME_FOR_MARKET[marketId]
    key = COINGECKO_ID_FOR_MARKET[marketId]
    return { name, symbol, key }
  }
  useEffect(() => {
    /* if (library) {
      getOptions(getMarketDetails().name)
    } */
  }, [library, marketId, getOptions])

  const { name, symbol, key } = getMarketDetails()
  const { data, mutate } = useSWR(
    `https://api.coingecko.com/api/v3/simple/price?ids=${key}&vs_currencies=usd&include_24hr_change=true`
  )

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      mutate()
    }, 1000)
    return () => clearInterval(refreshInterval)
  }, [blink, setBlink, name])

  useEffect(() => {
    if (data !== prevPrice.current) {
      setBlink(true)
    }
    prevPrice.current = data
  }, [blink, data, setBlink])

  useEffect(() => {
    const resetBlinkTimeout = setTimeout(() => {
      setBlink(false)
    }, 500)
    return () => clearTimeout(resetBlinkTimeout)
  }, [blink, setBlink])

  return (
    <StyledHeader>
      <LitContainer>
        <GoBack to="/markets" />

        <Spacer />
        <StyledTitle>
          <StyledLogo src={getIconForMarket(symbol)} alt={formatName(name)} />

          <Spacer size="lg" />
          <StyledContent>
            <StyledSymbol>{symbol.toUpperCase()}</StyledSymbol>
            <Spacer size="sm" />
            <StyledName>{formatName(name)}</StyledName>
          </StyledContent>

          <Spacer size="lg" />
          <StyledContent>
            <StyledSymbol>Price</StyledSymbol>
            <Spacer size="sm" />
            <StyledPrice blink={blink}>
              {data ? (
                `$ ${formatBalance(data[key].usd)}`
              ) : (
                <StyledLoadingBlock />
              )}
            </StyledPrice>
          </StyledContent>

          <Spacer size="lg" />
          <StyledContent>
            <StyledSymbol>24hr Change</StyledSymbol>
            <Spacer size="sm" />
            <StyledPrice blink={blink}>
              {data ? (
                `${formatBalance(data[key].usd_24h_change)}%`
              ) : (
                <StyledLoadingBlock />
              )}
            </StyledPrice>
          </StyledContent>

          <Spacer size="lg" />
          <StyledContent>
            <StyledSymbol>Total Liquidity</StyledSymbol>
            <Spacer size="sm" />
            <StyledPrice>
              {options.calls[0] ? (
                options.reservesTotal !== 0 ? (
                  `$ ${formatBalance(options.reservesTotal)}`
                ) : (
                  'N/A'
                )
              ) : (
                <StyledLoadingBlock />
              )}
            </StyledPrice>
          </StyledContent>
        </StyledTitle>
      </LitContainer>
    </StyledHeader>
  )
}

const StyledContent = styled(Box)`
  align-items: baseline;
  flex-direction: row;
`

const StyledHeader = styled.div`
  background-color: ${(props) => props.theme.color.grey[800]};
  padding-bottom: ${(props) => props.theme.spacing[4]}px;
  padding-top: ${(props) => props.theme.spacing[4]}px;
`

const StyledLoadingBlock = styled.div`
  background-color: ${(props) => props.theme.color.grey[400]};
  border-radius: 12px;
  height: 24px;
  width: 60px;
`
const StyledTitle = styled.div`
  align-items: center;
  flex-direction: row;
  color: ${(props) => props.theme.color.white};
  display: flex;
  margin-top: ${(props) => props.theme.spacing[2]}px;
`

const StyledName = styled.span`
  font-size: 24px;
  font-weight: 700;
  margin-right: ${(props) => props.theme.spacing[2]}px;
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
interface StyledPriceProps {
  size?: 'sm' | 'md' | 'lg'
  blink?: boolean
}

const StyledPrice = styled.span<StyledPriceProps>`
  color: ${(props) => (props.blink ? '#00ff89' : props.theme.color.white)};
  font-size: ${(props) =>
    props.size === 'lg' ? 36 : props.size === 'sm' ? 12 : 24}px;
  font-weight: 700;
`

export default MarketHeader
