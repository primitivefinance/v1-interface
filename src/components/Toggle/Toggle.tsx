import React, { Fragment } from 'react'
import styled from 'styled-components'

import Spacer from '../Spacer'

const Toggle: React.FC = ({ children }) => {
  const l = React.Children.toArray(children).length

  return (
    <StyledSwtich>
      {React.Children.map(children, (child, i) => (
        <Fragment>
          {child}
          {i < l - 1 && <Spacer size="sm" />}
        </Fragment>
      ))}
    </StyledSwtich>
  )
}

const StyledSwtich = styled.div`
  align-items: center;
  background: ${(props) => props.theme.color.grey[800]};
  border-radius: ${(props) => props.theme.borderRadius}px;
  display: flex;
  padding: ${(props) => props.theme.spacing[2]}px;
`

export default Toggle
