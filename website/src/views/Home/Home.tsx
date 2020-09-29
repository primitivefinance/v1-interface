import React from 'react'
import styled from 'styled-components'

import Button from 'components/Button'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import { Container, Box, Spacer } from 'react-neu'

const Home: React.FC = () => {
  return (
    <Page>
      <StyledHero>
        <PageHeader
          icon="<3"
          title="Options for a permissionless future."
          subtitle="Decentralized, open, and easy."
        />
        <Container size="lg">
          <Box row justifyContent="center">
            <Button text="App" />
            <Spacer />
            <Button text="Documentation" variant="secondary" />
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

export default Home
