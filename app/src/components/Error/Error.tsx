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
    <Card>
      <CardTitle>
        <StyledTitle>Error</StyledTitle>
        <Button variant="transparent" size="sm" onClick={() => clearError()}>
          <ClearIcon />
        </Button>
      </CardTitle>
      <StyledContent>{msg}</StyledContent>
      {link}
    </Card>
  )
}

const StyledContent = styled.h4`
  color: red;
`
const StyledTitle = styled(Box)`
  align-items: center;
  display: flex;
  flex-direction: row;
  width: 100%;
`

export default Error
