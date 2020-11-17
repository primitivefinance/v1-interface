import React, { useState } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import Spacer from '@/components/Spacer'
import { useClearNotif, useNotifs } from '@/state/notifs/hooks'
import { useClickAway } from '@/hooks/utils/useClickAway'
import ClearIcon from '@material-ui/icons/Clear'
import TwitterIcon from '@material-ui/icons/Twitter'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'

export interface TradeProps {
  title?: string
  msg?: string
  link?: string
}

export const Trade: React.FC<TradeProps> = ({ title, msg, link }) => {
  const clearNotif = useClearNotif()
  const nodeRef = useClickAway(() => {
    clearNotif(2)
  })
  if (!title) return null
  return (
    <StyledContainer>
      <StyledCard>
        <CardTitle>
          <StyledTitle>
            <CheckCircleIcon /> <Spacer size="sm" />
            {title}
          </StyledTitle>
          <Button variant="transparent" size="sm" onClick={() => clearNotif(2)}>
            <ClearIcon />
          </Button>
        </CardTitle>
        <CardContent>
          <StyledContent>{msg}</StyledContent>
          <StyledTwitter href={link} target="__none">
            <StyledButtonText>Tweet Your Trade</StyledButtonText>
            <Spacer size="sm" />
            <TwitterIcon />
          </StyledTwitter>
        </CardContent>
      </StyledCard>
    </StyledContainer>
  )
}
const StyledContainer = styled.div`
  width: 25em;
`
const StyledTwitter = styled.a`
  border-color: #1da1f2; //twitter blue
  border-width: 2px;
  border-style: solid;
  padding: 0px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  text-decoration: none;
  color: #1da1f2;
`
const StyledButtonText = styled.h4``

const StyledCard = styled(Card)`
  background: ${(props) => props.theme.color.grey[600]};
  border-radius: 5px;
  width: 100%;
`
const StyledContent = styled.h4`
  margin-top: -1em;
  color: white;
  text-decoration: none;
  width: inherit;
`
const StyledTitle = styled(Box)`
  align-items: center;
  display: flex;
  flex-direction: row;
  color: ${(props) => props.theme.color.green[500]};
  width: 100%;
`
export default Trade
