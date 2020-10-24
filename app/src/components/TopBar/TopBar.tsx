import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styled from 'styled-components'

import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import NotificationsIcon from '@material-ui/icons/Notifications'

import PrimitiveIcon from '../../assets/img/primitive-logo.svg'

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
      <Container alignItems="center" display="flex" height={72}>
        <StyledNav>
          <Link href="/">
            <StyledNavItem active>
              <StyledLogo src={PrimitiveIcon} alt="Primitive Logo" />
            </StyledNavItem>
          </Link>
          <Link href="/">
            <StyledNavItem active>
              <Logo />
            </StyledNavItem>
          </Link>
          <Spacer size="lg" />
          <Link href="/create">
            <StyledNavItem
              active={location.pathname === '/create' ? true : false}
            >
              Create
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
        <Spacer size="lg" />
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
  border-bottom: 1px solid ${(props) => props.theme.color.grey[600]};
  color: ${(props) => props.theme.color.white};
  display: flex;
  flex-direction: column;
  height: 72px;
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
  align-items: center;
  display: flex;
  flex: 1;
  font-weight: 700;
  justify-content: center;
`

interface StyledNavItemProps {
  active: boolean
}

const StyledNavItem = styled.a<StyledNavItemProps>`
  color: ${(props) =>
    props.active ? props.theme.color.white : props.theme.color.grey[400]};
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-decoration: none;
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
