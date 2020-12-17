import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'

import Button from '../Button'
import Card from '../Card'
import CardContent from '../CardContent'
import Spacer from '../Spacer'
import CardIcon from '../CardIcon'
import Loader from '../Loader'
import LockIcon from '@material-ui/icons/Lock'

import { MARKETS, Market } from '@/constants/index'
import { useWeb3React } from '@web3-react/core'

const MarketCards: React.FC = () => {
  const markets = MARKETS
  return (
    <StyledCards>
      {markets[0] ? (
        <StyledRow>
          {markets.map((m, i) => (
            <React.Fragment key={i}>
              <MarketCard market={m} />
              {i === 0 || i === 1}
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

export interface MarketCardProps {
  market: Market
}

const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
  const poolActive = market.name !== 'Soon...'
  const { chainId } = useWeb3React()
  if (!market.active && chainId === 1) {
    return (
      <StyledCard>
        <Overlay>
          <LockIcon style={{ fontSize: '60px' }} />
        </Overlay>
        <CardContent>
          <StyledContent>
            <CardIcon>
              {market.icon !== '' ? (
                <img
                  height="64"
                  src={market.icon}
                  style={{ borderRadius: '50%' }}
                  alt={'icon'}
                />
              ) : (
                <></>
              )}
            </CardIcon>
            <StyledTitle>{market.name}</StyledTitle>
            <StyledDetails>
              <StyledDetail>{market.id.toUpperCase()} / DAI</StyledDetail>
            </StyledDetails>
          </StyledContent>
        </CardContent>
      </StyledCard>
    )
  }
  return (
    <StyledCardWrapper href={`/markets/${encodeURIComponent(market.id)}/calls`}>
      <StyledCard>
        <CardContent>
          <StyledContent>
            <CardIcon>
              {market.icon !== '' ? (
                <img
                  height="64"
                  src={market.icon}
                  style={{ borderRadius: '50%' }}
                  alt={'icon'}
                />
              ) : (
                <></>
              )}
            </CardIcon>
            <StyledTitle>{market.name}</StyledTitle>
            <StyledDetails>
              <StyledDetail>{market.id.toUpperCase()} / DAI</StyledDetail>
            </StyledDetails>
          </StyledContent>
        </CardContent>
      </StyledCard>
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
  flex-flow: row wrap;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`

const StyledCard = styled.div`
  display: flex;
  position: relative;
  width: calc((900px - ${(props) => props.theme.spacing[4]}px * 2) / 3);
  margin: ${(props) => props.theme.spacing[2]}px;
`

const Overlay = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  padding: -1em;
  z-index: 200;
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.color.grey[400]};
  cursor: not-allowed;
  &: hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`
const StyledCardWrapper = styled(Link)``

const StyledTitle = styled.h4`
  color: ${(props) => props.theme.color.white};
  font-size: 24px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px 0 0;
  padding: 0;
`

const StyledContent = styled.div`
  align-items: center;
  cursor: pointer;
  border: 3px solid ${(props) => props.theme.color.grey[800]};
  display: flex;
  background: ${(props) => props.theme.color.grey[800]};
  flex-direction: column;
  padding: 1em;
  border-radius: 5px;
  box-shadow: 3px 3px 3px rgba(250, 250, 250, 0.1);
  &: hover {
    background: transparent;
    border 3px solid ${(props) => props.theme.color.black};
    box-shadow: 3px 3px 3px rgba(250, 250, 250, 0);

  }
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
