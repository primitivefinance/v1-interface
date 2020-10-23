import React, { useState } from 'react'
import styled from 'styled-components'
import SettingsIcon from '@material-ui/icons/Settings'
import IconButton from '@/components/IconButton'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'

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
          <Box alignItems="center" justifyContent="center" row>
            <Box alignItems="flex-start" justifyContent="space-between" column>
              <h5>Preferred Stablecoin</h5>
              <h5>Other Settings</h5>
              <h5>Even More User Settings</h5>
            </Box>
            <Spacer size="sm" />
            <Box alignItems="flex-start" justifyContent="space-between" column>
              <h5>Preferred Stablecoin</h5>
              <h5>Other Settings</h5>
              <h5>Even More User Settings</h5>
            </Box>
          </Box>
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

const StyledModal = styled.div`
  padding-left: 1em;
  width: 70%;
  top: 10em;
  right: 15%;
  border-radius: 0.3em;
  z-index: 0;
  position: fixed;
  z-index: 9999 !important;
  background: ${(props) => props.theme.color.grey[600]};
  color: white;
`
