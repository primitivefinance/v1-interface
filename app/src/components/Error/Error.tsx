import React, { useState } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import useError from '@/hooks/useError'
import ClearIcon from '@material-ui/icons/Clear'

const Error: React.FC = () => {
  const { error, msg, link, clearError } = useError()

  if (!error) return null
  return (
    <StyledCard>
      <CardTitle>
        <StyledTitle>Error</StyledTitle>
        <Button variant="transparent" size="sm" onClick={() => clearError()}>
          <ClearIcon />
        </Button>
      </CardTitle>
      <CardContent>
        <StyledContent>{msg}</StyledContent>
      </CardContent>
    </StyledCard>
  )
}

const StyledCard = styled.div`
  position: absolute;
  bottom: 2em;
  left: 40px;
  width: 30em !important;
  background: ${(props) => props.theme.color.grey[600]};
  border-radius: 15px;
  max-width: 30em !important;
`
const StyledContent = styled.h4`
  margin-top: -1em;
  color: red;
  width: inherit;
`
const StyledTitle = styled(Box)`
  align-items: center;
  display: flex;
  flex-direction: row;
  width: 100%;
`

export default Error
