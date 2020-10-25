import React from 'react'
import styled from 'styled-components'

const CardContent: React.FC = (props) => {
  return <StyledCardContent>{props.children}</StyledCardContent>
}

const StyledCardContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  background: ${(props) => props.theme.color.black};
  border-radius: 0.2em 0.2em 0 0;
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) => props.theme.color.grey[600]};
  padding: ${(props) => props.theme.spacing[4]}px;
`

export default CardContent
