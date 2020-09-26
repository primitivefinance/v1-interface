import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import GoBack from '../../../../components/GoBack'
import LitContainer from '../../../../components/LitContainer'

import usePrices from '../../../../hooks/usePrices'

export interface MarketHeaderProps {
  marketId: string
}

const MarketHeader: React.FC<MarketHeaderProps> = (props) => {
  const [blink, setBlink] = useState(true)
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

  const { prices, getPrices } = usePrices()

  useEffect(() => {
    getPrices(name.toLowerCase())
    let refreshInterval = setInterval(() => {
      getPrices(name.toLowerCase())
      setBlink((b) => !b)
    }, 5000)
    return () => clearInterval(refreshInterval)
  }, [name, getPrices, prices])

  const source = 'coingecko'

  return (
    <StyledHeader>
      <LitContainer>
        <GoBack to="/markets" />
        <StyledTitle>
          <StyledName>
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </StyledName>
          <StyledSymbol>{symbol.toUpperCase()}</StyledSymbol>
        </StyledTitle>
        <StyledPrice blink={true}>
          {prices[name.toLowerCase()] ? (
            `$${(+prices[name.toLowerCase()]).toFixed(2)}`
          ) : (
            <StyledLoadingBlock />
          )}
        </StyledPrice>
        <StyledSource>
          {source} {blink ? 'true' : 'false'}
        </StyledSource>
      </LitContainer>
    </StyledHeader>
  )
}

const StyledLoadingBlock = styled.div`
  background-color: ${(props) => props.theme.color.grey[400]};
  width: 60px;
  height: 24px;
  border-radius: 12px;
`

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
  blink?: boolean
}

const StyledPrice = styled.span<StyledPriceProps>`
  font-size: 24px;
  font-weight: 700;
  margin-right: ${(props) => props.theme.spacing[2]}px;
  color: ${(props) =>
    props.blink ? props.theme.color.green : props.theme.color.grey[400]};
`

export default MarketHeader
