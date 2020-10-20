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

const TopBar: React.FC = () => {
  const location = useRouter()
  return (
    <StyledTopBar>
      <Container
        alignItems="center"
        justifyContent="flex-start"
        display="flex"
        flexDirection="row"
        height={65}
      >
        <StyledNav>
          <Link href="/">
            <StyledNavItem active>
              <StyledLogo src="/primitive-logo.svg" alt="Primitive Logo" />
            </StyledNavItem>
          </Link>
          <Link href="/">
            <StyledNavItem active>
              <Logo />
            </StyledNavItem>
          </Link>
          <Link href="/portfolio">
            <StyledNavItem
              active={location.pathname === '/portfolio' ? true : false}
            >
              Portfolio
            </StyledNavItem>
          </Link>
          <Link href="/markets">
            <StyledNavItem
              active={
                location.pathname.indexOf('/markets') !== -1 ? true : false
              }
            >
              Markets
            </StyledNavItem>
          </Link>
          <Link href="/create">
            <StyledNavItem
              active={location.pathname === '/create' ? true : false}
            >
              Create
            </StyledNavItem>
          </Link>
        </StyledNav>
        <div style={{ width: '30rem' }} />
        <StyledFlex>
          <Wallet />
          <Spacer size="md" />
          <Settings />
          <Spacer size="md" />
        </StyledFlex>
      </Container>
    </StyledTopBar>
  )
}

const StyledTopBar = styled.div`
  background-color: ${(props) => props.theme.color.black};
  color: ${(props) => props.theme.color.white};
  display: flex;
  flex-direction: column;
  height: 65px;
  top: 0em;
  padding-top: 0.3em;
  position: fixed;
  width: 100%;
`

const StyledFlex = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
`

const StyledNav = styled.div`
  display: flex;
  flex: 1;
  font-weight: 700;
  justify-content: center;
  align-items: center;
`

interface StyledNavItemProps {
  active: boolean
}

const StyledNavItem = styled.h3<StyledNavItemProps>`
  color: ${(props) =>
    props.active ? props.theme.color.white : props.theme.color.grey[400]};
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-decoration: none;
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
