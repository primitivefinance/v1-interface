import React, { useState } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import Spacer from '@/components/Spacer'
import CardTitle from '@/components/CardTitle'
import { useClearNotif, useNotifs } from '@/state/notifs/hooks'
import { useClickAway } from '@/hooks/utils/useClickAway'

import ClearIcon from '@material-ui/icons/Clear'
import WarningIcon from '@material-ui/icons/Warning'

export interface TradeProps {
  title: string
  msg: string
  link?: string
}

export const Trade: React.FC<TradeProps> = ({ title, msg, link }) => {
  const clearNotif = useClearNotif()
  const nodeRef = useClickAway(() => {
    clearNotif(1)
  })
  return (
    <StyledContainer ref={nodeRef}>
      <StyledCard>
        <CardTitle>
          <StyledTitle>
            <WarningIcon />
            <Spacer size="sm" />
            {title}
          </StyledTitle>
          <Button variant="transparent" size="sm" onClick={() => clearNotif(1)}>
            <ClearIcon />
          </Button>
        </CardTitle>
        <CardContent>
          <StyledContent>{msg}</StyledContent>
          {link === '' ? null : (
            <StyledButton variant="secondary" href={link}>
              Learn More
            </StyledButton>
          )}
        </CardContent>
      </StyledCard>
    </StyledContainer>
  )
}
const StyledContainer = styled.div`
  width: 25em;
`

const StyledButton = styled(Button)`
  max-width: 1em;
`

const StyledCard = styled(Card)`
  background: ${(props) => props.theme.color.grey[600]};
  border-radius: 5px;
  max-width: 30em;
`
const StyledContent = styled.h4`
  margin-top: -0em;
  color: white;
  text-decoration: none;
  width: inherit;
  padding: 1em 1em 0 1em;
`
const StyledTitle = styled(Box)`
  align-items: center;
  display: flex;
  flex-direction: row;
  color: yellow;
  width: 100%;
`
export default Trade
