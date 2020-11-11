import React from 'react'
import styled from 'styled-components'

const CardTitle: React.FC = (props) => {
  return <StyledCardTitle>{props.children}</StyledCardTitle>
}

const StyledCardTitle = styled.div`
  align-items: center;
  color: ${(props) => props.theme.color.white};
  display: flex;
  font-weight: 700;
  font-size: 18px;
  padding-top: ${(props) => props.theme.spacing[3]}px;
  padding-left: ${(props) => props.theme.spacing[4]}px;
  padding-right: ${(props) => props.theme.spacing[4]}px;
  padding-bottom: ${(props) => props.theme.spacing[2]}px;
`

export default CardTitle
