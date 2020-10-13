import React from 'react'
import styled from 'styled-components'

import Link from 'next/link'

import Button from '../Button'
import Card from '../Card'
import CardContent from '../CardContent'
import Spacer from '../Spacer'
import CardIcon from '../CardIcon'
import Loader from '../Loader'

import { Market } from '../../contexts/Markets'
import { MARKETS } from '../../constants'

const MarketCards: React.FC = () => {
  const markets = MARKETS
  return (
    <StyledCards>
      {!!markets[0] ? (
        <StyledRow>
          {markets.map((market, i) => (
            <React.Fragment key={i}>
              <MarketCard market={market} />
              {(i === 0 || i === 1) && <StyledSpacer />}
            </React.Fragment>
          ))}
        </StyledRow>
        
      ) : (
        <StyledLoadingWrapper>
          <Loader text="Loading markets" />
        </StyledLoadingWrapper>
      )}
    </StyledCards>
  )
}

interface MarketCardProps {
  market: Market
}

const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
  const poolActive = market.name !== 'Soon...'
  return (
    <StyledCardWrapper>
      <Card>
        <CardContent>
          <StyledContent>
            <CardIcon>
              {market.icon ? (
              <img
                height="64"
                src={market.icon}
                style={{ filter: 'brightness(2) grayscale(1)' }}
                alt={'ether icon'}
              />  
              ) : (
                null
              )}
            </CardIcon>
            <StyledTitle>{market.name}</StyledTitle>
            <StyledDetails>
              <StyledDetail>{market.id.toUpperCase()} / USD</StyledDetail>
            </StyledDetails>
            <Spacer />
            <Link href={`/markets/${market.id}`}>
              <Button
                disabled={!poolActive}
                full
                text="Continue"
              />
            </Link>
          </StyledContent>
        </CardContent>
      </Card>
    </StyledCardWrapper>
  )
}

const StyledCards = styled.div`
  width: 900px;
  @media (max-width: 768px) {
    width: 100%;
  }
`

const StyledLoadingWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
  color: ${(props) => props.theme.color.white};
`

const StyledRow = styled.div`
  display: flex;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
  flex-flow: row wrap;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`

const StyledCardWrapper = styled.div`
  display: flex;
  width: calc((900px - ${(props) => props.theme.spacing[4]}px * 2) / 3);
  position: relative;
`

const StyledTitle = styled.h4`
  color: ${(props) => props.theme.color.white};
  font-size: 24px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px 0 0;
  padding: 0;
`

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const StyledSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`

const StyledDetails = styled.div`
  margin-top: ${(props) => props.theme.spacing[2]}px;
  text-align: center;
`

const StyledDetail = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
`

export default MarketCards
