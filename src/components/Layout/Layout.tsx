import Footer from '@/components/Footer'
import TopBar from '@/components/TopBar'
import { useClearOptions } from '@/state/options/hooks'
import { useRemoveItem } from '@/state/order/hooks'
import React, { useEffect } from 'react'
import styled from 'styled-components'
interface PageProps {
  children: any
  full?: boolean
  loading?: boolean
}

const Layout: React.FC<PageProps> = (props) => {
  const removeItem = useRemoveItem()
  const clearOptions = useClearOptions()

  useEffect(() => {
    if (props.loading) {
      // purge orders on route change
      removeItem()
      clearOptions()
    }
  }, [props.loading])

  return (
    <>
      <TopBar loading={props.loading} />
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
