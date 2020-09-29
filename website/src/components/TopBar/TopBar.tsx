import React from 'react'
import styled from 'styled-components'

import { Box, Container, Spacer } from 'react-neu'
import Button from 'components/Button'
import Logo from 'components/Logo'

const TopBar: React.FC = () => {
  return (
    <Container size="lg">
      <Box alignItems="center" height={72} row>
        <Logo />
        <Box flex={1} />
        <Box alignItems="center" row>
          <Spacer />
          <Button href="https://app.primitive.finance" size="sm" text="App" />
        </Box>
      </Box>
    </Container>
  )
}

export default TopBar
