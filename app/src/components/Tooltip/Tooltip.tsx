import React, { useState } from 'react'
import styled from 'styled-components'
import Box from '@/components/Box'
import InfoIcon from '@material-ui/icons/Info'

export interface TooltipProps {
  children: React.ReactNode
  text: string
  icon?: boolean
  direction?: 'bottom' | 'left'
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  text,
  icon = true,
  direction = 'bottom',
}) => {
  const [open, setOpen] = useState(false)
  const onOver = () => {
    setOpen(true)
  }
  const onLeave = () => {
    setOpen(false)
  }
  if (icon) {
    return (
      <Box row>
        {children}
        <StyledContainer onMouseOver={onOver} onMouseLeave={onLeave}>
          {icon ? <StyledInfoIcon /> : null}
        </StyledContainer>
        {open && text ? <Tip>{text}</Tip> : null}
      </Box>
    )
  }
  return (
    <>
      {children}
      <StyledContainer onMouseOver={onOver} onMouseLeave={onLeave}>
        {icon ? <StyledInfoIcon /> : null}
        {open && text ? <Tip>{text}</Tip> : null}
      </StyledContainer>
    </>
  )
}

const StyledInfoIcon = styled(InfoIcon)`
  font-size: 20px !important;
  margin-left: 5px;
  color: ${(props) => props.theme.color.grey[600]};
  &: hover {
    color: ${(props) => props.theme.color.grey[400]};
  }
`

const StyledContainer = styled.div`
  position: relative;
  display: inline-block;
  //border-bottom: 1px dotted black;
  cursor: pointer;
`
const Tip = styled.div`
  background: ${(props) => props.theme.color.grey[800]};
  color: ${(props) => props.theme.color.white};
  font-size: 12px;
  max-width: 10em;
  text-align: center;
  padding: 5px;
  border-radius: 6px;
  border: 1px solid ${(props) => props.theme.color.grey[600]};
  margin: 2.2em 0 0 2em;
  position: absolute;
  z-index: 200 !important;
`
