import React from 'react'
import styled from 'styled-components'
import { Container, Box, Spacer, Separator } from 'react-neu'

import Button from 'components/Button'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'

import Leaf from './assets/greek-leaf.png'

const Home: React.FC = () => {
  return (
    <Page>
      <StyledHero>
        <PageHeader
          icon={''}
          title="Options for a permissionless future."
          subtitle="Decentralized, open, and easy."
        />
        <Container size="lg">
          <Box row justifyContent="center">
            <Button text="Start Trading" href="https://app.primitive.finance" />
          </Box>
        </Container>
      </StyledHero>
      <Container size="lg">
        <StyledSectionInformation>Learn more below.</StyledSectionInformation>
        <Spacer size="lg" />
        <Separator />
        <Spacer size="lg" />
        <IconContainer>
          <StyledIcon>
            <img src={Leaf} height="124px" alt="vines" />
          </StyledIcon>
        </IconContainer>
        <Spacer size="md" />
        <StyledTitle>
          A protocol built on Ethereum for decentralized options.
        </StyledTitle>
        <Spacer size="md" />
        <StyledSubtitle>No admin keys.</StyledSubtitle>
        <Spacer size="md" />
        <StyledSubtitle>No oracles.</StyledSubtitle>
        <Spacer size="md" />
        <StyledSubtitle>No signup.</StyledSubtitle>
        <Spacer size="md" />
        <StyledSubtitle>No whitelist.</StyledSubtitle>
        <Spacer size="lg" />
        <IconContainer>
          <Button to="beta" text="Join the Open Beta" />
        </IconContainer>
        <Spacer size="lg" />
      </Container>
    </Page>
  )
}

const StyledHero = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: calc(80vh - 96px);
  max-height: 600px;
  min-height: 400px;
`

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
`

const StyledIcon = styled.span.attrs({
  role: 'img',
})`
  font-size: 96px;
  min-height: 96px;
  line-height: 96px;
  text-align: center;
  min-width: 96px;
  @media (max-width: 768px) {
    font-size: 64px;
    text-align: left;
  }
`

const StyledTitle = styled.h1`
  color: ${props => props.theme.textColor};
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  padding: 0;
  text-align: center;
  @media (max-width: 768px) {
    text-align: left;
  }
`

const StyledSubtitle = styled.h1`
  color: ${props => props.theme.textColor};
  font-size: 18px;
  font-weight: 400;
  margin: 0;
  opacity: 0.66;
  padding: 0;
  text-align: center;
  @media (max-width: 768px) {
    text-align: left;
  }
`

const StyledSectionInformation = styled.div`
  color: ${props => props.theme.textColor};
  font-size: 14px;
  font-weight: 500;
  opacity: 0.5;
  margin: 0;
  padding: 0;
  text-align: center;
`

export default Home
