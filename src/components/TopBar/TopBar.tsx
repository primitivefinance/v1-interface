import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styled from 'styled-components'

import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import NotificationsIcon from '@material-ui/icons/Notifications'

import Container from '@/components/Container'
import IconButton from '@/components/IconButton'
import Spacer from '@/components/Spacer'
import Logo from '@/components/Logo'
import Settings from '@/components/Settings'
import { Wallet } from '@/components/Wallet'
import { useWeb3React } from '@web3-react/core'

const TopBar: React.FC = () => {
  const location = useRouter()
  const { chainId } = useWeb3React()
  return (
    <StyledTopBar>
      <Container
        alignItems="center"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        height={72}
      >
        <StyledFlex>
          <Link href="/">
            <StyledNavItem active>
              <StyledLogo
                src="https://storage.googleapis.com/app-image-cdn/primitive-logo-white.png"
                alt="Primitive Logo"
              />
            </StyledNavItem>
          </Link>
          <div style={{ marginLeft: '-1em' }} />
          <Link href="/">
            <StyledNavItem active>
              <Logo />
            </StyledNavItem>
          </Link>
        </StyledFlex>
        <StyledNav isMain={chainId !== 1}>
          <Link href="/markets">
            <StyledNavItem active={location.pathname.startsWith('/markets')}>
              Markets
            </StyledNavItem>
          </Link>
          <Link href="/liquidity">
            <StyledNavItem
              active={location.pathname === '/liquidity' ? true : false}
            >
              Liquidity
            </StyledNavItem>
          </Link>
          <Link href="/contracts">
            <StyledNavItem
              active={
                location.pathname.indexOf('/contracts') !== -1 ? true : false
              }
            >
              Contracts
            </StyledNavItem>
          </Link>
          <Link href="/faq">
            <StyledNavItem active={location.pathname === '/faq' ? true : false}>
              FAQ
            </StyledNavItem>
          </Link>
          <Link href="/risks">
            <StyledNavItem
              active={location.pathname === '/risks' ? true : false}
            >
              Risks
            </StyledNavItem>
          </Link>
        </StyledNav>
        <StyledFlex>
          <Spacer size="lg" /> <Spacer size="lg" />
          <Spacer size="lg" /> <Spacer size="lg" />
          <Wallet />
          <Spacer size="sm" />
          <Spacer size="sm" />
          <Settings />
        </StyledFlex>
      </Container>
    </StyledTopBar>
  )
}

interface NavProps {
  isMain: boolean
}

const StyledTopBar = styled.div`
  background-color: #040404;
  border-bottom: 0px solid ${(props) => props.theme.color.grey[600]};
  color: ${(props) => props.theme.color.white};
  display: flex;
  flex-direction: column;
  height: 72px;
  position: sticky;
  z-index: 250;
  top: -1px;
`

const StyledFlex = styled.div`
  align-items: center;
  display: flex;
  flex: 0.2;
  margin: 0 1em 0 1em;
`

const StyledNav = styled.div<NavProps>`
  align-items: center;
  display: flex;
  flex: 1;
  font-weight: 500;
  border-bottom: 0px solid ${(props) => props.theme.color.grey[600]};
  width: 1px;
  justify-content: center;
  position: absolute;
  left: ${(props) => (props.isMain ? 50 : 50)}%;
  right: ${(props) => (props.isMain ? 50 : 50)}%;
`

interface StyledNavItemProps {
  active: boolean
}

const StyledNavItem = styled.a<StyledNavItemProps>`
  color: ${(props) =>
    props.active ? props.theme.color.white : props.theme.color.grey[400]};
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-transform: uppercase;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  cursor: pointer;
  &:hover {
    color: ${(props) => props.theme.color.white};
  }
`

const StyledLogo = styled.img`
  padding-top: 0.3em;
  width: ${(props) => props.theme.spacing[5]}px;
  height: ${(props) => props.theme.spacing[5]}px;
`

export default TopBar
