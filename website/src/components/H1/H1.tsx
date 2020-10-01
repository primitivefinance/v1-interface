import React from 'react'
import styled from 'styled-components'

const H1: React.FC = ({ children }) => {
  return <StyledSectionTitle>{children}</StyledSectionTitle>
}

const StyledSectionTitle = styled.div`
  color: ${props => props.theme.textColor};
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  padding: 0;
  text-align: center;
`

export default H1
