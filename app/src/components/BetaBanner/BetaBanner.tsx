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
      <CloseButton onClick={handleClose} variant="transparent" size="sm">
        <CloseIcon fontSize="small" />
      </CloseButton>
      <StyledLink href="https://primitive.finance/beta">
        <StyledTitle>
          Earn NFT Rewards
          <LaunchIcon fontSize="inherit" />
        </StyledTitle>
      </StyledLink>
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
  align-items: flex-start;
  display: flex;
  padding: 0.3em;
  flex-direction: row;
  border-radius: 1em;
  justify-content: center;
  height: 5em;
  position: fixed;
  width: 10em;
  bottom: 1em;
  left: 1em;
  background: linear-gradient(
    45deg,
    rgba(255, 0, 0, 0.75) 0%,
    rgba(255, 154, 0, 0.75) 10%,
    rgba(208, 222, 33, 0.75) 20%,
    rgba(79, 220, 74, 0.75) 30%,
    rgba(63, 218, 216, 0.75) 40%,
    rgba(47, 201, 226, 0.75) 50%,
    rgba(28, 127, 238, 0.75) 60%,
    rgba(95, 21, 242, 0.75) 70%,
    rgba(186, 12, 248, 0.75) 80%,
    rgba(251, 7, 217, 0.75) 90%,
    rgba(255, 0, 0, 0.75) 100%
  );
`

export default BetaBanner
