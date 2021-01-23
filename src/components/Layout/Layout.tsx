import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRemoveItem } from '@/state/order/hooks'
import Spacer from '@/components/Spacer'
import Footer from '@/components/Footer'
import Loader from '@/components/Loader'
import TopBar from '@/components/TopBar'
interface PageProps {
  children: any
  full?: boolean
  loading?: boolean
}

const Layout: React.FC<PageProps> = (props) => {
  const removeItem = useRemoveItem()

  useEffect(() => {
    if (props.loading) {
      // purge orders on route change
      removeItem()
    }
  }, [props.loading])

  if (props.loading) {
    return (
      <>
        <TopBar />
        <StyledPage>
          <Spacer />
          <Loader />
        </StyledPage>
        <Footer />
      </>
    )
  }
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
const StyledLoading = styled.div`
  margin: 0 auto;
  padding-top: 5em;
`
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
