import React, { useEffect } from 'react'
import styled from 'styled-components'
import Box from '@/components/Box'
import Logo from '@/components/Logo'

const SplashScreen = () => {
  return (
    <StyledContainer row justifyContent="center" alignItems="center">
      <StyledLogo
        src="https://storage.googleapis.com/about-me-215602.appspot.com/primitive-logo.png"
        alt="Primitive Logo"
      />
    </StyledContainer>
  )
}

const StyledContainer = styled(Box)`
  z-index: 999;
  background: black;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  animation: scale 2s alternate infinite;
  @keyframes scale {
    100% {
      transform: scale(1.4, 1.4);
    }
  }
`
const StyledLogo = styled.img`
  width: 5em;
  height 5em;
`

export default SplashScreen
