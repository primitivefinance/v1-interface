import React from 'react'
import styled from 'styled-components'

const LitContainer: React.FC = (props) => {
  return (
    <StyledLitContainer>
      <StyledLitContainerContent>{props.children}</StyledLitContainerContent>
    </StyledLitContainer>
  )
}

const StyledLitContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`
const StyledLitContainerContent = styled.div`
  width: ${(props) => props.theme.contentWidth * (2 / 3)}px;
`

export default LitContainer
