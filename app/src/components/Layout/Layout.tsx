import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import Banner from '@/components/Banner'
import Footer from '@/components/Footer'
import TopBar from '@/components/TopBar'
import SplashScreen from '@/components/SplashScreen'
import { useResetNotif } from '@/state/notifs/hooks'

interface PageProps {
  children: any
  full?: boolean
}

const Layout: React.FC<PageProps> = (props) => {
  return (
    <>
      <TopBar />
      <StyledPage>
        <StyledMain full={props.full}>{props.children}</StyledMain>
      </StyledPage>
      <Footer />
    </>
  )
}

const StyledPage = styled.div``
const StyledLink = styled.a`
  text-decoration: none;
  color: yellow;
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
