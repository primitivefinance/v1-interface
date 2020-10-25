import React, { useState } from 'react'
import styled from 'styled-components'
import SettingsIcon from '@material-ui/icons/Settings'
import IconButton from '@/components/IconButton'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import Button from '@/components/Button'

import { useClickAway } from '../../hooks/utils/useClickAway'

export const Settings = () => {
  const [open, setOpen] = useState(null)

  const onClick = () => {
    setOpen(true)
  }
  const onClose = () => {
    setOpen(false)
  }
  const nodeRef = useClickAway(() => {
    setOpen(false)
  })
  if (open) {
    return (
      <>
        <IconButton>
          <SettingsIcon style={{ color: 'black' }} />
        </IconButton>
        <StyledModal ref={nodeRef}>
          <StyledRow>
            <StyledContent>
              <StyledTitle>Settings</StyledTitle>
              <StyledSetting>Slippage tolerance</StyledSetting>
              <Spacer size="sm" />
              <StyledRow>
                <Button size="sm" text="0.10%" onClick={() => {}}></Button>
                <Spacer size="sm" />
                <Button size="sm" text="0.50%" onClick={() => {}}></Button>
                <Spacer size="sm" />
                <Button size="sm" text="1.00%" onClick={() => {}}></Button>
              </StyledRow>
            </StyledContent>
          </StyledRow>
        </StyledModal>
      </>
    )
  }
  return (
    <IconButton onClick={onClick} variant="tertiary">
      <SettingsIcon style={{ color: 'white' }} />
    </IconButton>
  )
}

const StyledTitle = styled.div`
  font-weight: 700;
`

const StyledSetting = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 12px;
  font-weight: 400;
`

const StyledContent = styled(Box)`
  align-items: flex-start;
  flex-direction: column;
  justify-content: space-between;
`

const StyledRow = styled(Box)`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
`

const StyledModal = styled.div`
  background: ${(props) => props.theme.color.grey[800]};
  border: 1px solid ${(props) => props.theme.color.grey[500]}ff;
  border-radius: ${(props) => props.theme.borderRadius}px;
  color: ${(props) => props.theme.color.white};
  padding: ${(props) => props.theme.spacing[3]}px;
  position: fixed;
  right: 15%;
  top: ${(props) => props.theme.barHeight}px;
  z-index: 0;
  z-index: 9999 !important;
`
