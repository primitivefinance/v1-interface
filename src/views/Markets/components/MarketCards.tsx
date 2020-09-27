import React from 'react'
import styled from 'styled-components'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Spacer from '../../../components/Spacer'
import CardIcon from '../../../components/CardIcon'
import Loader from '../../../components/Loader'

import { Market } from '../../../contexts/Markets'
import useMarkets from '../../../hooks/useMarkets'

const MarketCards: React.FC = () => {
  const [markets] = useMarkets()
  const rows = markets.reduce<Market[][]>(
    (marketRows, market) => {
      const newMarketRows = [...marketRows]
      if (newMarketRows[newMarketRows.length - 1].length === 3) {
        newMarketRows.push([market])
      } else {
        newMarketRows[newMarketRows.length - 1].push(market)
      }
      return newMarketRows
    },
    [[]]
  )

  return (
    <StyledCards>
      {!!rows[0].length ? (
        rows.map((marketRow, i) => (
          <StyledRow key={i}>
            {marketRow.map((market, j) => (
              <React.Fragment key={j}>
                <MarketCard market={market} />
                {(j === 0 || j === 1) && <StyledSpacer />}
              </React.Fragment>
            ))}
          </StyledRow>
        ))
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
            <CardIcon>{market.icon}</CardIcon>
            <StyledTitle>{market.name}</StyledTitle>
            <StyledDetails>
              <StyledDetail>{market.id.toUpperCase()} / USD</StyledDetail>
            </StyledDetails>
            <Spacer />
            <Button
              disabled={!poolActive}
              full
              text="Select"
              to={`/markets/${market.id}`}
            />
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
