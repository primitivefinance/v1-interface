import React, { useEffect } from 'react'
import styled from 'styled-components'
import Box from '@/components/Box'
import Logo from '@/components/Logo'

const SplashScreen = () => {
  return (
    <StyledContainer row justifyContent="center" alignItems="center">
      <StyledDiv>
        <StyledLogo
          src="https://storage.googleapis.com/about-me-215602.appspot.com/primitive-logo.png"
          alt="Primitive Logo"
        />
      </StyledDiv>
    </StyledContainer>
  )
}

const StyledContainer = styled(Box)`
  z-index: 999;
  background: black;
  position: absolute;
  height: 100vh;
  width: 100%;
  overflow: hidden;
`
const StyledLogo = styled.img`
  width: 100px;
`
const StyledDiv = styled.div`
  animation: scale 2s alternate infinite;
  @keyframes scale {
    100% {
      transform: scale(1.4, 1.4);
    }
  }
`
export default SplashScreen
