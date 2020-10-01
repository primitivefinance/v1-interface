import React from 'react'
import styled from 'styled-components'

const Subtitle: React.FC = ({ children }) => {
  return <StyledSubtitle>{children}</StyledSubtitle>
}

const StyledSubtitle = styled.h1`
  color: ${props => props.theme.textColor};
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  opacity: 0.66;
  padding: 0;
  text-align: center;
  @media (max-width: 768px) {
    text-align: left;
  }
`

export default Subtitle
