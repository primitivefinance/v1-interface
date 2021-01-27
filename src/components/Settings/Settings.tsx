import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import SettingsIcon from '@material-ui/icons/Settings'
import IconButton from '@/components/IconButton'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import Button from '@/components/Button'
import Slider from '@/components/Slider'

import { useLocalStorage } from '@/hooks/utils/useLocalStorage'
import { useClickAway } from '@/hooks/utils/useClickAway'
import { useSlippage, useUpdateSlippage } from '@/state/user/hooks'
import { DEFAULT_SLIPPAGE, LocalStorageKeys } from '@/constants/index'

export const Settings = () => {
  const [open, setOpen] = useState(null)
  const slippage = useSlippage()
  const setSlippage = useUpdateSlippage()
  const [stored, setStored] = useLocalStorage<string>(
    LocalStorageKeys.Slippage,
    DEFAULT_SLIPPAGE
  )
  useEffect(() => {
    setSlippage(stored)
  }, [])
  const onClick = () => {
    setOpen(true)
  }
  const nodeRef = useClickAway(() => {
    setOpen(false)
  })
  const handleSlip = (s: string) => {
    setStored(s)
    setSlippage(s)
  }
  const handleSlippageChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setStored(e.currentTarget.value.toString())
      setSlippage(e.currentTarget.value.toString())
    },
    [setSlippage]
  )
  if (open) {
    return (
      <>
        <StyledIconButton>
          <SettingsIcon />
        </StyledIconButton>
        <StyledModal ref={nodeRef}>
          <StyledContent>
            <StyledTitle>Settings</StyledTitle>
            <Spacer size="sm" />
            <StyledSetting>Slippage Tolerance</StyledSetting>
            <Spacer size="sm" />
            <StyledRow>
              <StyledSlip>{(+slippage * 100).toFixed(2)}%</StyledSlip>
              <Slider
                min={0.001}
                max={0.3}
                step={0.001}
                value={parseFloat(slippage)}
                onChange={handleSlippageChange}
              />
            </StyledRow>
            <StyledRow>
              <Button
                variant="secondary"
                size="sm"
                text="0.50%"
                onClick={() => handleSlip('0.005')}
              ></Button>
              <Spacer size="sm" />
              <Button
                variant="secondary"
                size="sm"
                text="1.00%"
                onClick={() => handleSlip('0.01')}
              ></Button>
              <Spacer size="sm" />
              <Button
                variant="secondary"
                size="sm"
                text="2.00%"
                onClick={() => handleSlip('0.02')}
              ></Button>
            </StyledRow>
          </StyledContent>
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

const StyledIconButton = styled(IconButton)`
  color: black;
  &: hover {
    color: white;
  }
`
const StyledSlip = styled.div`
  margin: 0 0.4em 0 0;
  color: ${(props) => props.theme.color.white} !important;
  width: 5em;
  height: 2.3em;
  display: flex;
  align-items: center;
`

const StyledTitle = styled.div`
  font-weight: 700 !important;
  font-size: 18px !important;
`

const StyledSetting = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 12px !important;
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
  width: 15em;
`

const StyledModal = styled.div`
  background: ${(props) => props.theme.color.black};
  border-color: ${(props) => props.theme.color.grey[600]};
  border-style: solid;
  border-width: 2px;
  border-radius: ${(props) => props.theme.borderRadius}px;
  color: ${(props) => props.theme.color.white};
  padding: ${(props) => props.theme.spacing[3]}px;
  margin: -0.5em 2em 1em 1em;
  position: fixed;
  z-index: 900 !important;
  right: 5px;
  top: ${(props) => props.theme.barHeight}px;
  box-shadow: 3px -3px 3px rgba(250, 250, 250, 0.1);
`
