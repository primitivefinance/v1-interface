import React, { useState } from 'react'
import styled from 'styled-components'

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
  const toggle = () => {
    console.log(open)
    setOpen(!open)
  }
  return (
    <StyledContainer onMouseOver={toggle} onMouseLeave={toggle}>
      {open ? <Tip>{text}</Tip> : null}
      {children}
    </StyledContainer>
  )
}

const StyledContainer = styled.div`
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;
  cursor: pointer;
`
const Tip = styled.div`
  width: 120px;
  background-color: black;
  color: white;
  text-align: center;
  padding: 5px;
  border-radius: 6px;
  top: 2em;
  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
`
