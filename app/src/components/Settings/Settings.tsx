import React, { useState } from 'react'
import styled from 'styled-components'
import SettingsIcon from '@material-ui/icons/Settings'
import IconButton from '@/components/IconButton'
import Box from '@/components/Box'

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
          <Box alignItems="flex-start" justifyContent="space-between" column>
            <h5>Preferred Stablecoin</h5>
            <h5>Other Settings</h5>
            <h5>Even More User Settings</h5>
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
  background: ${(props) => props.theme.color.grey[600]};
  color: white;
`
