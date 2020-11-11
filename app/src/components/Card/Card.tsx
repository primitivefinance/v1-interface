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
  background-color: ${(props) => props.theme.color.grey[800]};
  border: 1px solid
    ${(props) =>
      props.border
        ? props.theme.color.grey[500]
        : props.theme.color.grey[300]}ff;
  border-radius: ${(props) => props.theme.borderRadius}px;
  //box-shadow: rgba(145, 136, 137, 0.15) 0px 8px 40px;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`

export default Card
