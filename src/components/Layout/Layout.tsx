import Footer from '@/components/Footer'
import { useRouter } from 'next/router'
import TopBar from '@/components/TopBar'
import { useClearOptions } from '@/state/options/hooks'
import { useRemoveItem } from '@/state/order/hooks'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { useClearPositions } from '@/state/positions/hooks'
import { useClearSwap } from '@/state/swap/hooks'
import Banner from '@/components/Banner'
import Spacer from '@/components/Spacer'
import Link from 'next/link'
import Button from '@/components/Button'
import { AbstractConnector } from '@web3-react/abstract-connector'
interface PageProps {
  children: any
  full?: boolean
  loading?: boolean
}

const Layout: React.FC<PageProps> = (props) => {
  const removeItem = useRemoveItem()
  const clearOptions = useClearOptions()
  const clearPositions = useClearPositions()
  const clearSwap = useClearSwap()
  const router = useRouter()
  const { active, account } = useWeb3React()
  useEffect(() => {
    if (!props.loading) {
      // purge orders on route change
      removeItem()
      clearPositions()
      clearOptions()
    } else {
      clearSwap()
    }
  }, [props.loading])

  return (
    <>
      <TopBar loading={props.loading && active} />
      <Banner>
        <StyledA>
          Primitive V1 is no longer supported by this interface. All deployed
          options have expired. Please close your positions.
        </StyledA>
      </Banner>

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

const StyledA = styled.div`
  cursor: pointer;
  color: ${(props) => props.theme.color.white};
  font-size: 14px;
`
interface StyledMainProps {
  full?: boolean
}

const StyledMain = styled.div<StyledMainProps>`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: 70vh;
`

export default Layout
