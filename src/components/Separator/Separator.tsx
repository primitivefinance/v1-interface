import React from 'react'
import styled from 'styled-components'

const Separator: React.FC = () => {
  return <StyledSeparator />
}

interface StyledSeparatorProps {
  size: number
}

const StyledSeparator = styled.div`
  border: 1px solid ${(props) => props.theme.color.grey[600]};
  width: 100%;
`

export default Separator
