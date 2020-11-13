import React, { useState } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import { useClearNotif, useNotifs } from '@/state/notifs/hooks'
import ClearIcon from '@material-ui/icons/Clear'

export const Notifs: React.FC = () => {
  const notifs = useNotifs()
  const clearNotif = useClearNotif()
  if (!notifs[0]) return null
  return (
    <StyledCard>
      <CardTitle>
        <StyledTitle>{notifs[0].title}</StyledTitle>
        <Button variant="transparent" size="sm" onClick={() => clearNotif(0)}>
          <ClearIcon />
        </Button>
      </CardTitle>
      <CardContent>
        <StyledContent>{notifs[0].message}</StyledContent>
        <StyledTwitter href={notifs[0].link} target="__none">
          <StyledButtonText>Share on Twitter</StyledButtonText>
        </StyledTwitter>
      </CardContent>
    </StyledCard>
  )
}

const StyledTwitter = styled.a`
  background: ${(props) => props.theme.color.blue};
  padding: 1em;
  border-radius
`
const StyledButtonText = styled.h5`
  color: white;
`

const StyledCard = styled.div`
  position: absolute;
  bottom: 4em;
  left: 40px;
  width: 20em !important;
  background: ${(props) => props.theme.color.grey[600]};
  border-radius: 5px;
  max-width: 30em !important;
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
  width: 100%;
`
