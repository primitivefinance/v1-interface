import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styled from 'styled-components'

import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import CancelIcon from '@material-ui/icons/Cancel'
import Container from '@/components/Container'
import IconButton from '@/components/IconButton'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import Logo from '@/components/Logo'
import Settings from '@/components/Settings'
import { Wallet } from '@/components/Wallet'

interface BannerProp {
  children: any
  round?: boolean
}

const Banner: React.FC<BannerProp> = ({ children, round = false }) => {
  const location = useRouter()
  const [is, setIs] = useState(true)
  if (!is) return null
  return (
    <StyledBanner round={round}>
      <Container
        alignItems="center"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        height={40}
      >
        <Spacer />

        <Box row>{children}</Box>
        <IconButton
          onClick={() => setIs(false)}
          size="sm"
          variant="transparent"
        >
          <CancelIcon style={{ color: 'white' }} />
        </IconButton>
      </Container>
    </StyledBanner>
  )
}
const StyledBanner = styled.div<BannerProp>`
  background-color: ${(props) => props.theme.color.grey[800]};
  border-top: 0px solid ${(props) => props.theme.color.grey[600]};
  color: ${(props) => props.theme.color.white} !important;
  border-radius: ${(props) => (props.round ? '.5em' : '0')};
  display: flex;
  flex-direction: column;
  height: 40px;
  font-size: 14px;
  width: 100%;
  z-index: 300;
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
