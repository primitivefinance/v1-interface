import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import GoBack from '@/components/GoBack'
import LitContainer from '@/components/LitContainer'
import Spacer from '@/components/Spacer'
import useSWR from 'swr'

import formatBalance from '@/utils/formatBalance'

const formatName = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

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
        <StyledTitle>
          <StyledName>{formatName(name)}</StyledName>
          <StyledSymbol>{symbol.toUpperCase()}</StyledSymbol>
        </StyledTitle>
        <StyledContent>
          <StyledPrice blink={blink}>
            {data ? (
              `$${formatBalance(data[name].usd)}`
            ) : (
              <StyledLoadingBlock />
            )}
          </StyledPrice>
          <StyledPrice blink={blink} size="sm">
            {data ? (
              `${formatBalance(data[name].usd_24h_change)}% Today`
            ) : (
              <StyledLoadingBlock />
            )}
          </StyledPrice>
          <Spacer size="sm" />
          <StyledSource>via {source}</StyledSource>
        </StyledContent>
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
  align-items: baseline;
  color: ${(props) => props.theme.color.white};
  display: flex;
  margin-top: ${(props) => props.theme.spacing[2]}px;
`

const StyledName = styled.span`
  font-size: 24px;
  font-weight: 700;
  margin-right: ${(props) => props.theme.spacing[2]}px;
`
const StyledSource = styled.span`
  color: ${(props) => props.theme.color.grey[400]};
  letter-spacing: 1px;
  font-size: 12px;
`

const StyledSymbol = styled.span`
  color: ${(props) => props.theme.color.grey[400]};
  letter-spacing: 1px;
  text-transform: uppercase;
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
  margin: ${(props) => props.theme.spacing[1]}px;
`

export default MarketHeader
