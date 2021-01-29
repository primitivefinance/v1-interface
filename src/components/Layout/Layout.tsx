import Footer from '@/components/Footer'
import { useRouter } from 'next/router'
import TopBar from '@/components/TopBar'
import { useClearOptions } from '@/state/options/hooks'
import { useRemoveItem } from '@/state/order/hooks'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { useClearPositions } from '@/state/positions/hooks'
interface PageProps {
  children: any
  full?: boolean
  loading?: boolean
}

const Layout: React.FC<PageProps> = (props) => {
  const removeItem = useRemoveItem()
  const clearOptions = useClearOptions()
  const clearPositions = useClearPositions()
  const router = useRouter()
  const { active, account } = useWeb3React()
  useEffect(() => {
    if (!props.loading) {
      // purge orders on route change
      removeItem()
      clearPositions()
      clearOptions()
    }
  }, [props.loading])

  return (
    <>
      <TopBar loading={props.loading && active} />
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
`

export default Layout
