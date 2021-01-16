import React, { Fragment } from 'react'
import styled from 'styled-components'

import Spacer from '../Spacer'

interface ToggleProps {
  full?: boolean
}

const Toggle: React.FC<ToggleProps> = ({ children, full }) => {
  const l = React.Children.toArray(children).length

  return (
    <StyledSwtich full={full}>
      {React.Children.map(children, (child, i) => (
        <Fragment>
          {child}
          {i < l - 1 && <Spacer size="sm" />}
        </Fragment>
      ))}
    </StyledSwtich>
  )
}

interface SwitchProps {
  full?: boolean
}

const StyledSwtich = styled.div<SwitchProps>`
  align-items: center;
  background: ${(props) => props.theme.color.grey[900]};
  border-radius: ${(props) => props.theme.borderRadius}px;
  display: flex;
  padding: ${(props) => (props.full ? null : props.theme.spacing[2])}px;
  width: ${(props) => (props.full ? '100%' : null)};
`

export default Toggle
