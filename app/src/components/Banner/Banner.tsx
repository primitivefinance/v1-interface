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

const Banner: React.FC = ({ children }) => {
  const location = useRouter()
  return (
    <StyledBanner>
      <Container
        alignItems="center"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        height={36}
      >
        <StyledFlex>{children}</StyledFlex>
      </Container>
    </StyledBanner>
  )
}

const StyledBanner = styled.div`
  background-image: -webkit-linear-gradient(
    top,
    rgba(0, 0, 0, 1),
    rgba(255, 0, 0, 0)
  );
  border-top: 1px solid ${(props) => props.theme.color.grey[600]};
  color: ${(props) => props.theme.color.white};
  display: flex;
  flex-direction: column;
  height: ${(props) => props.theme.barHeight / 2}px;
  position: fixed;
  top: 72px;
  width: 100%;
`

const StyledFlex = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: center;
`

const StyledNav = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  font-weight: 400;
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

export default Banner
