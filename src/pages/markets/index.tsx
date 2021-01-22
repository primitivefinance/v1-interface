import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import PageHeader from '@/components/PageHeader'
import MarketCards from '@/components/MarketCards'
import MarketTable from '@/components/MarketTable/MarketTable'
import Spacer from '@/components/Spacer'
import { Grid, Col, Row } from 'react-styled-flexboxgrid'
import { useClearNotif } from '@/state/notifs/hooks'
import { useClearOptions } from '@/state/options/hooks'
import { useClearPositions } from '@/state/positions/hooks'
import { useRemoveItem } from '@/state/order/hooks'

const days: { [key: number]: React.ReactNode } = {
  1: (
    <img
      height="64"
      src={
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Epsilon_uc_lc.svg/1280px-Epsilon_uc_lc.svg.png'
      }
      style={{ filter: 'invert(1)' }}
      alt={'monday greek'}
    />
  ),
  2: (
    <img
      height="64"
      src={
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Lambda_uc_lc.svg/1280px-Lambda_uc_lc.svg.png'
      }
      style={{ filter: 'invert(1)' }}
      alt={'monday greek'}
    />
  ),
  3: (
    <img
      height="64"
      src={
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Delta_uc_lc.svg/1280px-Delta_uc_lc.svg.png'
      }
      style={{ filter: 'invert(1)' }}
      alt={'monday greek'}
    />
  ),
  4: (
    <img
      height="64"
      src={
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Theta_uc_lc.svg/1280px-Theta_uc_lc.svg.png'
      }
      style={{ filter: 'invert(1)' }}
      alt={'monday greek'}
    />
  ),
  5: (
    <img
      height="64"
      src={
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Gamma_uc_lc.svg/1280px-Gamma_uc_lc.svg.png'
      }
      style={{ filter: 'invert(1)' }}
      alt={'monday greek'}
    />
  ),
  6: (
    <img
      height="64"
      src={
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Phi_uc_lc.svg/1280px-Phi_uc_lc.svg.png'
      }
      style={{ filter: 'invert(1)' }}
      alt={'monday greek'}
    />
  ),
  7: (
    <img
      height="64"
      src={
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Omega_uc_lc.svg/1280px-Omega_uc_lc.svg.png'
      }
      style={{ filter: 'invert(1)' }}
      alt={'monday greek'}
    />
  ),
  8: (
    <img
      height="64"
      src={
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Pi_uc_lc.svg/1280px-Pi_uc_lc.svg.png'
      }
      style={{ filter: 'invert(1)' }}
      alt={'monday greek'}
    />
  ),
}

export async function getStaticProps() {
  const a = await fetch(
    `https://raw.githubusercontent.com/primitivefinance/primitive-token-lists/main/crypto-assets.json`
  )
  const asset = await a.json()

  const d = await fetch(
    `https://raw.githubusercontent.com/primitivefinance/primitive-token-lists/main/defi-tokens.json`
  )
  const defi = await d.json()

  if (!asset || !defi) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      asset,
      defi,
    }, // will be passed to the page component as props
  }
}

const Markets: React.FC = ({ asset, defi }) => {
  const [day, setDay] = useState(0)
  const clear = useClearNotif()
  const clearOptions = useClearOptions()
  const clearPositions = useClearPositions()
  const removeItem = useRemoveItem()

  const isItPiDay = (dateObject) => {
    const date = dateObject.getDate()
    const month = dateObject.getMonth()
    if (month === 2) {
      if (date === 14) {
        return true
      }
    }
    return false
  }
  useEffect(() => {
    const date = new Date()
    clear(0)
    const currentDay = date.getDay()
    clearOptions()
    clearPositions()
    removeItem()
    if (isItPiDay(date)) {
      setDay(8)
    } else {
      setDay(currentDay)
    }
  }, [day, setDay])

  return (
    <>
      <StyledContainer>
        <PageHeader
          icon={days[day]}
          title="Option Markets"
          subtitle="View available options, trade tokens, and manage positions"
        />
        <MarketTable lists={{ asset, defi }} />
      </StyledContainer>
      <Spacer />
    </>
  )
}

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 50em;
  max-width: 1000px;
`
export default Markets
