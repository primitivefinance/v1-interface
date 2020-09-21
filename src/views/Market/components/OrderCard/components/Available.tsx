import React from 'react'

import styled from 'styled-components'

const Available: React.FC = ({ children }) => {
  return (
    <StyledAvailable>{children}</StyledAvailable>
  )
}

const StyledAvailable = styled.div`
  align-items: center;
  border-top: 1px solid ${(props) => props.theme.color.grey[600]};
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  height: 56px;
  justify-content: center;
  margin-bottom: -${(props) => props.theme.spacing[4]}px;
  margin-left: -${(props) => props.theme.spacing[4]}px;
  margin-right: -${(props) => props.theme.spacing[4]}px;
  margin-top: ${(props) => props.theme.spacing[4]}px;
  width: calc(100% + ${(props) => props.theme.spacing[4] * 2}px);
`

export default Available