import React, { useState } from 'react'
import styled from 'styled-components'
import SettingsIcon from '@material-ui/icons/Settings'
import IconButton from '@/components/IconButton'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import Button from '@/components/Button'
import { useClickAway } from '../../hooks/utils/useClickAway'
import { useSlippage } from '@/hooks/user'

export const Settings = () => {
  const [open, setOpen] = useState(null)
  const [slippage, setSlippage] = useSlippage()

  const onClick = () => {
    setOpen(true)
  }
  const onClose = () => {
    setOpen(false)
  }
  const nodeRef = useClickAway(() => {
    setOpen(false)
  })
  const handleSlip = (s: string) => {
    setSlippage(s)
  }
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
                {slippage === '0.001' ? (
                  <Button
                    size="sm"
                    text="0.10%"
                    disabled
                    onClick={() => handleSlip('0.001')}
                  ></Button>
                ) : (
                  <Button
                    size="sm"
                    text="0.10%"
                    onClick={() => handleSlip('0.001')}
                  ></Button>
                )}
                <Spacer size="sm" />
                {slippage === '0.005' ? (
                  <Button
                    size="sm"
                    text="0.50%"
                    disabled
                    onClick={() => handleSlip('0.005')}
                  ></Button>
                ) : (
                  <Button
                    size="sm"
                    text="0.50%"
                    onClick={() => handleSlip('0.005')}
                  ></Button>
                )}
                <Spacer size="sm" />
                {slippage === '0.01' ? (
                  <Button
                    size="sm"
                    text="1.00%"
                    disabled
                    onClick={() => handleSlip('0.01')}
                  ></Button>
                ) : (
                  <Button
                    size="sm"
                    text="1.00%"
                    onClick={() => handleSlip('0.01')}
                  ></Button>
                )}
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
  right: 10%;
  top: ${(props) => props.theme.barHeight + 10}px;
  z-index: 0;
  z-index: 9999 !important;
`
