import React from 'react'
import styled from 'styled-components'

interface CardProps {
  border?: boolean
}

const Card: React.FC<CardProps> = (props) => {
  return (
    <StyledCard border={props.border ? true : false}>
      {props.children}
    </StyledCard>
  )
}

const StyledCard = styled.div<CardProps>`
  background-color: ${(props) => props.theme.color.black};
  border-radius: ${(props) => props.theme.borderRadius}px;
  overflow: hidden;
  display: flex;
  border-radius: 0.2em 0.2em 0 0;
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) => props.theme.color.grey[600]};
  flex: 1;
  flex-direction: column;
`

export default Card
