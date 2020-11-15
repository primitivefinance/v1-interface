import React from 'react'
import styled from 'styled-components'
import Banner from '@/components/Banner'
import Footer from '@/components/Footer'
import Notifs from '@/components/Notifs'
import Spacer from '@/components/Spacer'
import TopBar from '@/components/TopBar'

import WarningIcon from '@material-ui/icons/Warning'
import LaunchIcon from '@material-ui/icons/Launch'

interface PageProps {
  children: any
  full?: boolean
}

const Layout: React.FC<PageProps> = (props) => {
  return (
    <>
      <TopBar />
      <Banner>
        <WarningIcon style={{ color: '#ff8040' }} />
        <Spacer />
        <StyledLink href="https://primitive.finance/beta">
          The Primitive protocol is in beta. <LaunchIcon fontSize="inherit" />
        </StyledLink>
      </Banner>
      <StyledPage>
        <StyledMain full={props.full}>{props.children}</StyledMain>
        <Notifs />
      </StyledPage>
      <Footer />
    </>
  )
}

const StyledPage = styled.div``
const StyledLink = styled.a`
  text-decoration: none;
  color: ${(props) => props.theme.color.orange[500]};
`

interface StyledMainProps {
  full?: boolean
}

const StyledMain = styled.div<StyledMainProps>`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: 70vh;
  width: 100%;
`

export default Layout
