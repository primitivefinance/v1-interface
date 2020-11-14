import React from 'react'
import styled from 'styled-components'

import Button from 'components/Button'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import { Container, Box, Spacer, Separator } from 'react-neu'

import Leaf from './assets/greek-leaf.png'

const Home: React.FC = () => {
  return (
    <Page>
      <StyledHero>
        <PageHeader
          icon={''}
          title="Options protocol for a permissionless future."
          subtitle="Decentralized, open, and user friendly."
        />
        <Container size="lg">
          <Box row justifyContent="center" flex="1">
            <Button text="Open App" href="https://app.primitive.finance" />
          </Box>
        </Container>
      </StyledHero>
      <Container size="lg">
        <Spacer size="lg" />
        <Separator />
        <Spacer size="lg" />
        <IconContainer>
          <img src={Leaf} height="124px" alt="vines" />
        </IconContainer>
        <Spacer size="md" />
        <StyledSectionTitle>
          Primitive is a peer-to-peer options protocol built for developers.
        </StyledSectionTitle>
        <Spacer size="md" />
        <StyledSectionSubtitle>
          The protocol is accessed through a free and open-sourced interface.
        </StyledSectionSubtitle>
        <Spacer size="lg" />
        <Container size="lg">
          <Box row justifyContent="center" flex="1">
            <Button to="/beta" text="Join the Open Beta" />
          </Box>
        </Container>
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

const StyledSectionTitle = styled.div`
  color: ${props => props.theme.colors.black};
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  padding: 0;
  text-align: center;
`

const StyledSectionSubtitle = styled.div`
  color: ${props => props.theme.colors.black};
  font-size: 24px;
  font-weight: 500;
  opacity: 0.75;
  margin: 0;
  padding: 0;
  text-align: center;
`

export default Home
