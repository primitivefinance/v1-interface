import React, { useState } from 'react'
import styled from 'styled-components'
import InfoIcon from '@material-ui/icons/Info'

export interface TooltipProps {
  children: React.ReactNode
  text: string
  direction?: 'bottom' | 'left'
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  text,
  direction = 'bottom',
}) => {
  const [open, setOpen] = useState(false)
  const onOver = () => {
    setOpen(true)
  }
  const onLeave = () => {
    setOpen(false)
  }
  return (
    <StyledContainer onMouseOver={onOver} onMouseLeave={onLeave}>
      {open ? <Tip>{text}</Tip> : null}
      {children}
      <StyledInfoIcon />
    </StyledContainer>
  )
}

const StyledInfoIcon = styled(InfoIcon)`
  font-size: 10px !important;
  margin-bottom: 7px;
  color: ${(props) => props.theme.color.grey[400]};
`

const StyledContainer = styled.div`
  position: relative;
  display: inline-block;
  //border-bottom: 1px dotted black;
  cursor: pointer;
`
const Tip = styled.div`
  width: 120px;
  background-color: black;
  color: ${(props) => props.theme.color.white};
  text-align: center;
  padding: 10px;
  border-radius: 6px;
  top: 1em;
  left: 5em;
  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
`
