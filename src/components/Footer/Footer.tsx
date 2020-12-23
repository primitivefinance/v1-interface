import React from 'react'
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
  bottom: -1.5em;
  width: 100%;
  pointer-events: none;
  z-index: 200;
`

const Loader = styled.div`
  animation: ${breathe} 2s infinite;
  background-color: ${(props) => props.theme.color.white};
  border-radius: 50%;
  color: ${(props) => props.theme.color.white};
  height: 10px;
  margin-left: 1em;
  width: 10px;
`
const StyledBlockNumber = styled.h5`
  align-items: center;
  padding: px;
  opacity: 90%;
  border-radius: 10px;
  color: ${(props) => props.theme.color.white};
  background-color: ${(props) => props.theme.color.black};
  display: flex;
  max-height: 0.1em;
  padding: ${(props) => props.theme.spacing[4]}px;
`
const StyledFooter = styled.footer`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-left: 0em;
  padding-right: 0em;
  justify-content: space-between;
  pointer-events: none;
`
const StyledFooterInner = styled.div`
  align-items: center;
  display: flex;
  height: 2em;
  justify-content: center;
  max-width: ${(props) => props.theme.siteWidth}px;
  margin-right: ${(props) => props.theme.spacing[4]}px;
  padding: ${(props) => props.theme.spacing[4]}px;
`

export default Footer
