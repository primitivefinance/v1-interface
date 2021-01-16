import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import PageHeader from '@/components/PageHeader'
import MarketCards from '@/components/MarketCards'
import Spacer from '@/components/Spacer'
import Box from '@/components/Box'
import LitContainer from '@/components/LitContainer'
import Chart from '@/components/Chart'

interface CardProps {
  title?: string
  description?: string
  multiplier?: number
}

export const DataCard: React.FC<CardProps> = ({
  title,
  description,
  multiplier,
}) => {
  return (
    <StyledCardContainer multiplier={multiplier ? multiplier : 2}>
      <CardContent>
        <CardTitle>{title ? title : 'No title'}</CardTitle>
      </CardContent>
      <CardContent>
        <Text>{description ? description : 'No description'}</Text>
      </CardContent>
    </StyledCardContainer>
  )
}

export const Graph: React.FC = () => {
  return <Box>Graph</Box>
}

const Liquidity: React.FC = () => {
  return (
    <StyledLitContainer>
      <StyledLitContainerContent>
        <StyledHeaderContainer>
          <DataCard
            title={'Total Liquidity'}
            multiplier={3}
            description={'10 WETH'}
          />
          <DataCard multiplier={3} />
          <DataCard multiplier={3} />
        </StyledHeaderContainer>
        <Spacer />
        <StyledHeaderContainer>
          {/* <Chart /> */}
          <DataCard />
        </StyledHeaderContainer>
      </StyledLitContainerContent>
    </StyledLitContainer>
  )
}

const StyledLitContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`
const StyledLitContainerContent = styled.div`
  width: ${(props) => props.theme.contentWidth}px;
`

const StyledHeaderContainer = styled.div`
  background-color: ${(props) => props.theme.color.grey[700]};
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: ${(props) => props.theme.spacing[3]}px;
`

interface CardContainerProps {
  multiplier: number
}

const StyledCardContainer = styled(Box)<CardContainerProps>`
  border: 1px solid grey;
  border-radius: ${(props) => props.theme.borderRadius}px;
  margin: ${(props) => props.theme.spacing[3]}px;
  padding: ${(props) => props.theme.spacing[2]}px;
  width: ${(props) => props.theme.contentWidth * (1 / props.multiplier)}px;
`

const CardTitle = styled.span`
  font-size: 18px;
  color: ${(props) => props.theme.color.white};
  opacity: 0.5;
  letter-spacing: 1px;
  text-transform: uppercase;
`

const Text = styled.span`
  color: ${(props) => props.theme.color.white};
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
`

const CardContent = styled(Box)`
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing[2]}px;
`

export default Liquidity
