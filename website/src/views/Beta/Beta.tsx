import React from 'react'
import styled from 'styled-components'

import Button from 'components/Button'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import { Container, Box } from 'react-neu'

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

export default Beta
