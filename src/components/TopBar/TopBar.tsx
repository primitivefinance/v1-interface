import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'

import LaunchIcon from '@material-ui/icons/Launch'

import Container from '@/components/Container'
import IconButton from '@/components/IconButton'
import Spacer from '@/components/Spacer'
import Logo from '@/components/Logo'
import Settings from '@/components/Settings'
import { Wallet } from '@/components/Wallet'
import { useWeb3React } from '@web3-react/core'
interface BarProps {
  children?: any
  loading?: boolean
}
const TopBar: React.FC<BarProps> = ({ children, loading }) => {
  const location = useRouter()
  const { chainId, account } = useWeb3React()
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
          <Link href={`/liquidity`}>
            <StyledNavItem active={location.pathname.startsWith('/liquidity')}>
              Liquidity
            </StyledNavItem>
          </Link>
          <a
            style={{ textDecoration: 'none' }}
            href="https://snapshot.page/#/primitive.eth"
            target="__blank"
          >
            <StyledNavItem active={false}>
              Governance{' '}
              <LaunchIcon style={{ marginLeft: '.3em', fontSize: '14px' }} />
            </StyledNavItem>
          </a>
          <a
            style={{ textDecoration: 'none' }}
            href="https://immunefi.com/bounty/primitive/"
            target="__blank"
          >
            <StyledNavItem active={false}>
              Bounties{' '}
              <LaunchIcon style={{ marginLeft: '.3em', fontSize: '14px' }} />
            </StyledNavItem>
          </a>
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
          <Wallet />
          <Spacer size="sm" />
        </StyledFlex>
      </Container>

      {loading ? (
        <StyledLoading>
          <StyledBar />
        </StyledLoading>
      ) : (
        <div style={{ minHeight: '3px' }} />
      )}
    </StyledTopBar>
  )
}

const changeColorWhileLoading = (color) => keyframes`
  0%   {background-color: ${color.grey[800]};}
  50%  {background-color: ${color.grey[600]};}
  100%  {background-color: ${color.grey[800]};}
`

const StyledLoading = styled.div`
  background: ${(props) => props.theme.color.grey[800]};
  min-height: 3px;
  animation: start 0.3s ease-in;
  position: relative;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  @keyframes start {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

const StyledBar = styled.div`
  z-index: 400;
  height: 3px;
  width: 15%;

  animation: growBar1 1s linear infinite alternate;
  @keyframes growBar1 {
    0% {
      background: ${(props) => props.theme.color.grey[800]};
      margin: 0 0 0 0;
    }
    50% {
      background: ${(props) => props.theme.color.grey[600]};
      margin: 0 50em 0 50em;
    }
    100% {
      background: ${(props) => props.theme.color.grey[800]};
      margin: 0 0 0 100em;
    }
  }
`

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
  display: flex;
  flex-direction: row;
  align-items: center;
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
  width: ${(props) => props.theme.spacing[5]}px;
  height: ${(props) => props.theme.spacing[5]}px;
`

export default TopBar
