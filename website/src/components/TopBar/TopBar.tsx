import React from 'react'

import { Box, Container, Spacer } from 'react-neu'
import Button from 'components/Button'
import Logo from 'components/Logo'

const TopBar: React.FC = () => {
  return (
    <Container size="lg">
      <Box alignItems="center" height={96} row>
        <Logo />
        <Box flex={1} />
        <Box alignItems="center" row>
          <Button
            href="https://docs.primitive.finance"
            size="md"
            text="Docs"
            variant="transparent"
          />
          <Spacer />
          <Button href="https://app.primitive.finance" size="md" text="App" />
        </Box>
      </Box>
    </Container>
  )
}

export default TopBar
