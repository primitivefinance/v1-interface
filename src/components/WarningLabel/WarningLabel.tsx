import React from 'react'
import styled from 'styled-components'

const WarningLabel: React.FC = ({ children }) => (
  <StyledWarningLabel>{children}</StyledWarningLabel>
)

const StyledWarningLabel = styled.div`
  color: ${(props) => props.theme.color.red[500]};
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  letter-spacing: 1px;
  text-transform: uppercase;
  vertical-align: middle;
  font-size: inherit;
  opacity: 1;
`

export default WarningLabel
