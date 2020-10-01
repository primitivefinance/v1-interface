import React from 'react'
import styled from 'styled-components'

const Subtitle: React.FC = ({ children }) => {
  return <StyledSectionSubtitle>{children}</StyledSectionSubtitle>
}

const StyledSectionSubtitle = styled.div`
  color: ${props => props.theme.textColor};
  font-size: 24px;
  font-weight: 700;
  opacity: 0.75;
  margin: 0;
  padding: 0;
  text-align: center;
`

export default Subtitle
