import React from 'react'
import styled from 'styled-components'

const Tabs: React.FC = (props) => {
  return <StyledTabs>{props.children}</StyledTabs>
}

const StyledTabs = styled.div`
  background-color: ${(props) => props.theme.color.grey[800]};
  border-radius: ${(props) => props.theme.borderRadius}px;
`

export default Tabs
