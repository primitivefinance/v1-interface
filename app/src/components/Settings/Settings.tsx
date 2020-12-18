import React, { useState, useCallback, useRef } from 'react'
import styled from 'styled-components'
import SettingsIcon from '@material-ui/icons/Settings'
import IconButton from '@/components/IconButton'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import Button from '@/components/Button'
import { useClickAway } from '@/hooks/utils/useClickAway'
import { useSlippage, useUpdateSlippage } from '@/state/user/hooks'
import Slider from '@/components/Slider'

export const Settings = () => {
  const [open, setOpen] = useState(null)
  const slippage = useSlippage()
  const setSlippage = useUpdateSlippage()

  const onClick = () => {
    setOpen(true)
  }
  const nodeRef = useClickAway(() => {
    setOpen(false)
  })
  const handleSlip = (s: string) => {
    setSlippage(s)
  }
  const handleSlippageChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setSlippage(e.currentTarget.value.toString())
    },
    [setSlippage]
  )
  if (open) {
    return (
      <>
        <IconButton>
          <SettingsIcon style={{ color: 'black' }} />
        </IconButton>
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

const StyledSlip = styled.div`
  margin: 0 0.4em 0 0;
  color: ${(props) => props.theme.color.white} !important;
  width: 5em;
  height: 2.3em;
  display: flex;
  align-items: center;
`

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
  margin: 0 2em 1em 1em;
  position: fixed;
  right: 0%;
  z-index: 0;
  z-index: 999 !important;
  top: ${(props) => props.theme.barHeight}px;
  box-shadow: -3px 3px 3px rgba(250, 250, 250, 0.1);
`
