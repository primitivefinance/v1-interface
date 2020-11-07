import React, { useState } from 'react'
import styled from 'styled-components'

import Button from '@/components/Button'
import Spacer from '@/components/Spacer'
import LaunchIcon from '@material-ui/icons/Launch'
import CloseIcon from '@material-ui/icons/Close'

export interface BetaBannerProps {
  isOpen: boolean
}

const BetaBanner: React.FC<BetaBannerProps> = ({ isOpen }) => {
  const [open, setOpen] = useState(isOpen)

  const handleClose = () => {
    setOpen(false)
  }
  if (!open) return null
  return (
    <StyledContainer>
      <StyledLink href="https://primitive.finance/beta">
        <StyledTitle>
          Make a Trade, Earn Rewards
          <Spacer />
          <LaunchIcon fontSize="inherit" />
        </StyledTitle>
      </StyledLink>
      {/* <Spacer size="sm" />
      <Button size="xs" onClick={() => change('TEST')}>
        Test Tokens
      </Button>
      <Spacer size="sm" /> */}
    </StyledContainer>
  )
}

const CloseButton = styled(Button)`
  padding-right: 10em;
  color: inherit;
`
const StyledLink = styled.a`
  text-decoration: none;
`

const StyledTitle = styled.h3`
  color: ${(props) => props.theme.color.white};
  display: flex;
  align-items: center;
  text-decoration: none;
  margin-top: 1em;
  font-size: 14px;
  font-weight: 700;
`

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  padding: 0em;
  flex-direction: row;
  border-radius: 0 0 0.2em 0.2em;
  justify-content: center;
  /* height: 3em; */
  width: 100%;
  bottom: 1em;
  left: 1em;
  background: linear-gradient(
    45deg,
    rgba(255, 0, 0, 1) 0%,
    rgba(255, 154, 0, 1) 10%,
    rgba(208, 222, 33, 1) 20%,
    rgba(79, 220, 74, 1) 30%,
    rgba(63, 218, 216, 1) 40%,
    rgba(47, 201, 226, 1) 50%,
    rgba(28, 127, 238, 1) 60%,
    rgba(95, 21, 242, 1) 70%,
    rgba(186, 12, 248, 1) 80%,
    rgba(251, 7, 217, 1) 90%,
    rgba(255, 0, 0, 1) 100%
  );
`

export default BetaBanner
