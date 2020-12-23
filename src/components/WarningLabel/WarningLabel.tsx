import React from 'react'
import styled from 'styled-components'

const WarningLabel: React.FC = ({ children }) => (
  <StyledWarningLabel>
    <p>{children}</p>
  </StyledWarningLabel>
)

const StyledWarningLabel = styled.div`
  color: ${(props) => props.theme.color.red[500]};
  display: table;
  align-items: center;
  justify-content: center;
  width: 100%;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-align: center;
  vertical-align: middle;
  font-size: 14px;
  opacity: 1;
`

export default WarningLabel
