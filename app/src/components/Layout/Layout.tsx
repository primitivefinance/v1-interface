import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import Banner from '@/components/Banner'
import Footer from '@/components/Footer'
import Spacer from '@/components/Spacer'
import TopBar from '@/components/TopBar'

import WarningIcon from '@material-ui/icons/Warning'
import LaunchIcon from '@material-ui/icons/Launch'
import { useResetNotif } from '@/state/notifs/hooks'

interface PageProps {
  children: any
  full?: boolean
}

const Layout: React.FC<PageProps> = (props) => {
  const clearNotifs = useResetNotif()
  const router = useRouter()

  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      clearNotifs()
    })
  })

  return (
    <>
      <TopBar />
      {/*<Banner>
        <StyledWarningIcon />
        <Spacer size="sm" />
        <StyledLink href="https://primitive.finance/beta">
          The Primitive protocol is in beta <LaunchIcon fontSize="inherit" />
        </StyledLink>
      </Banner> */}
      <StyledPage>
        <StyledMain full={props.full}>{props.children}</StyledMain>
      </StyledPage>
      <Footer />
    </>
  )
}

const StyledWarningIcon = styled(WarningIcon)`
  color: yellow;
`
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
