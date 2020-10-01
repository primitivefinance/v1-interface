import React from 'react'
import styled from 'styled-components'

import Button from 'components/Button'
import H1 from 'components/H1'
import Subtitle from 'components/Subtitle'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import { Container, Box, Spacer, Separator } from 'react-neu'

const Beta: React.FC = () => {
  return (
    <Page>
      <StyledHero>
        <PageHeader
          icon={''}
          title="The Open Beta is an 8-week event starting in October."
          subtitle="Trading on the supported networks makes you eligible for non-monetary NFT rewards. 
          The available rewards and event guide will be posted on the Primitive discord
          first, then updated on this page."
        />
        <Container size="lg">
          <Box row justifyContent="center">
            <Button text="Join the Discord" href="https://discord.gg/JBM6APT" />
          </Box>
        </Container>
      </StyledHero>
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

const StyledSectionInformation = styled.div`
  color: ${props => props.theme.colors.black};
  font-size: 14px;
  font-weight: 500;
  opacity: 0.5;
  margin: 0;
  padding: 0;
  text-align: center;
`

export default Beta
