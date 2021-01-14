import React from 'react'
import styled from 'styled-components'

interface CardProps {
  border?: boolean
  dark?: boolean
}

const Card: React.FC<CardProps> = (props) => {
  return (
    <StyledCard
      border={props.border ? true : false}
      dark={props.dark ? true : false}
    >
      {props.children}
    </StyledCard>
  )
}

const StyledCard = styled.div<CardProps>`
  background-color: ${(props) =>
    props.dark ? props.theme.color.black : props.theme.color.grey[900]};
  border: 1px solid
    ${(props) =>
      props.border
        ? props.theme.color.grey[500]
        : props.theme.color.grey[300]}ff;
  border-radius: ${(props) => props.theme.borderRadius}px;
  box-shadow: 3px 3px 3px rgba(250, 250, 250, 0.1);
  display: flex;
  flex: 1;
  flex-direction: column;
  z-index: 10;
`

export default Card
