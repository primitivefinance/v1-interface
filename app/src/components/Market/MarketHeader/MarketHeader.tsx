import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import Box from '../../Box'
import GoBack from '../../GoBack'
import LitContainer from '../../LitContainer'
import Spacer from '../../Spacer'
import useSWR from 'swr'
import { getPrice } from '@/utils/getPrice'
export interface MarketHeaderProps {
  marketId: string
}

const MarketHeader: React.FC<MarketHeaderProps> = (props) => {
  const prevPrice = useRef<number | null>(null)
  const [blink, setBlink] = useState(false)
  const { marketId } = props

  const getMarketDetails = () => {
    if (marketId === 'weth') {
      const name = 'ethereum'
      const symbol = 'ETH'
      return { name, symbol }
    } else {
      const name = 'ethereum'
      const symbol = 'ETH'
      return { name, symbol }
    }
  }

  const { name, symbol } = getMarketDetails()
  const { data, mutate } = useSWR(
    `https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=usd&include_24hr_change=true`
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

  const source = 'coingecko'

  return (
    <StyledHeader>
      <LitContainer>
        <GoBack to="/markets" />
        <Box>
          <StyledTitle>
            <StyledName>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </StyledName>
            <StyledSymbol>{symbol.toUpperCase()}</StyledSymbol>
          </StyledTitle>
          <StyledPrice blink={blink}>
            {data ? `$${(+data[name].usd).toFixed(2)}` : <StyledLoadingBlock />}
          </StyledPrice>
          <StyledPrice blink={blink} size="sm">
            {data ? (
              `${(+data[name].usd_24h_change).toFixed(2)}% Today`
            ) : (
              <StyledLoadingBlock />
            )}
          </StyledPrice>
          <Spacer size="sm" />
          <StyledSource>via {source}</StyledSource>
        </Box>
      </LitContainer>
    </StyledHeader>
  )
}

const StyledHeader = styled.div`
  max-width: 30em;
  background-color: ${(props) => props.theme.color.grey[800]};
  padding-bottom: ${(props) => props.theme.spacing[4]}px;
  padding-top: ${(props) => props.theme.spacing[4]}px;
`

const StyledTitle = styled.div`
  align-items: baseline;
  display: flex;
  margin-top: ${(props) => props.theme.spacing[2]}px;
  color: ${(props) => props.theme.color.white};
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

const StyledSource = styled.span`
  color: ${(props) => props.theme.color.grey[400]};
  letter-spacing: 1px;
  font-size: 12px;
`

interface StyledPriceProps {
  size?: 'sm' | 'md' | 'lg'
  blink?: boolean
}

const StyledPrice = styled.span<StyledPriceProps>`
  font-size: ${(props) =>
    props.size === 'lg' ? 36 : props.size === 'sm' ? 16 : 24}px;
  font-weight: 700;
  margin-right: ${(props) => props.theme.spacing[2]}px;
  color: ${(props) => (props.blink ? '#00ff89' : props.theme.color.white)};
`

/*
  color: ${(props) =>
    props.size === 'sm'
      ? props.theme.color.grey[400]
      : props.theme.color.white};
*/

export default MarketHeader
