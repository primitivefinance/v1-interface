import React, { useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { useBlockNumber } from '@/hooks/data'

import Nav from './components/Nav'

const Footer: React.FC = () => {
  const { data } = useBlockNumber()
  return (
    <StyledContainer>
      <StyledFooter>
        <StyledFooterInner>
          <Nav />
        </StyledFooterInner>
        <StyledBlockNumber>
          {data}
          <Loader />
        </StyledBlockNumber>
      </StyledFooter>
    </StyledContainer>
  )
}

const breathe = keyframes`
  0% { opacity: .5;}
  50% {opacity: 1; }
  100% { opacity: .5;}
;`

const StyledContainer = styled.div`
  position: fixed;
  bottom: -1em;
  width: 100%;
  pointer-events: none;
`

const Loader = styled.div`
  border-radius: 50%;
  width: 10px;
  margin-left: 1em;
  height: 10px;
  background-color: ${(props) => props.theme.color.white};
  color: ${(props) => props.theme.color.white};
  animation: ${breathe} 2s infinite;
`
const StyledBlockNumber = styled.h5`
  display: flex;
  align-items: center;
  background-color: ${(props) => props.theme.color.grey[800]};
  padding: 10px;
  opacity: 90%;
  border-radius: 10px;
  color: ${(props) => props.theme.color.white};
`
const StyledFooter = styled.footer`
  align-items: center;
  display: flex;
  padding-left: 1em;
  padding-right: 2em;
  justify-content: space-between;
  pointer-events: none;
`
const StyledFooterInner = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  max-width: ${(props) => props.theme.siteWidth}px;
  margin-right: ${(props) => props.theme.spacing[4]}px;
  padding: ${(props) => props.theme.spacing[4]}px;
`

export default Footer
