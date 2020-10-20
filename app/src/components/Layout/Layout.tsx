import React from 'react'
import styled from 'styled-components'
import TopBar from '@/components/TopBar'
import Footer from '@/components/Footer'
import Spacer from '@/components/Spacer'
import { useWeb3React } from '@web3-react/core'

interface PageProps {
  children: any
  full?: boolean
}

const Layout: React.FC<PageProps> = (props) => {
  return (
    <>
      <TopBar />
      <Spacer size="sm" />
      <StyledPage>
        <StyledMain full={props.full}>{props.children}</StyledMain>
      </StyledPage>
    </>
  )
}

const StyledPage = styled.div``

interface StyledMainProps {
  full?: boolean
}

const StyledMain = styled.div<StyledMainProps>`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
  width: 100%;
`

export default Layout
