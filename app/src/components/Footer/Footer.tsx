import React from 'react'
import styled, { keyframes } from 'styled-components'
import { useBlockNumber } from '@/hooks/data'

import Nav from './components/Nav'

const Footer: React.FC = () => {
  const { data } = useBlockNumber()
  return (
    <StyledFooter>
      <StyledFooterInner>
        <Nav />
        <StyledBlockNumber>
          {data}
          <Loader />
        </StyledBlockNumber>
      </StyledFooterInner>
    </StyledFooter>
  )
}

const breathe = keyframes`
  0% { opacity: .5;}
  50% {opacity: 1; }
  100% { opacity: .5;}
;`

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
  color: ${(props) => props.theme.color.white};
  display: flex;
  margin-right: ${(props) => props.theme.spacing[4]}px;
  padding: ${(props) => props.theme.spacing[4]}px;
`
const StyledFooter = styled.footer`
  align-items: center;
  bottom: 1em;
  display: flex;
  justify-content: flex-end;
  padding-left: 1em;
  padding-right: 2em;
  position: fixed;
  width: 100%;
`
const StyledFooterInner = styled.div`
  align-items: center;
  display: flex;
  height: ${(props) => props.theme.barHeight}px;
  justify-content: center;
  max-width: ${(props) => props.theme.contentWidth}px;
  padding: ${(props) => props.theme.spacing[4]}px;
`

export default Footer
