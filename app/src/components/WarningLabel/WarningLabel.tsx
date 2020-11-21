import React from 'react'
import styled from 'styled-components'

const WarningLabel: React.FC = ({ children }) => (
  <StyledWarningLabel>{children}</StyledWarningLabel>
)

const StyledWarningLabel = styled.div`
  color: ${(props) => props.theme.color.red[500]};
  display: flex;
  font-size: 14px;
  justify-content: center;
  align-items: center;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.66;
  width: 100%;
`

export default WarningLabel
