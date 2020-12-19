import React, { useEffect } from 'react'
import styled from 'styled-components'
import Box from '@/components/Box'
import Logo from '@/components/Logo'

const SplashScreen = () => {
  return (
    <StyledContainer>
      <StyledDiv>
        <StyledLogo
          src="https://storage.googleapis.com/app-image-cdn/background%20.png"
          alt="Primitive Logo"
        />
      </StyledDiv>
    </StyledContainer>
  )
}

const StyledContainer = styled.div`
  z-index: 200 !important;
  background: black;
  position: absolute;
  min-height: 100%;
  margin-top: -50em;
  min-width: 100%;
  overflow: hidden;
  display: table;
`
const StyledLogo = styled.img``
const StyledDiv = styled.div`
  initial-animation: none;
  background: black;
  animation: scale 1s alternate infinite;
  display: table-cell !important;
  text-align: center;
  vertical-align: middle;
  @keyframes scale {
    0% {
      transform: scale(1, 1);
    }
    100% {
      transform: scale(1.2, 1.2);
    }
  }
`
export default SplashScreen
