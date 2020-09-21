import React from 'react'

import Button, { ButtonProps } from '../Button'

interface ToggleButtonProps extends ButtonProps {
  active?: boolean
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
    active,
    ...buttonProps
}) => {
  return (
      <Button
        {...buttonProps}
        full
        variant={active ? "default" : 'tertiary' }
      />
  )
}

interface StyledToggleButtonProps {
  active?: boolean,
  background: string,
  boxShadow: string,
  fontSize: number,
  round?: boolean,
  size: number
}

export default ToggleButton