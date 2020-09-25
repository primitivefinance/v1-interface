import React, { useCallback } from 'react'
import styled from 'styled-components'

import LitContainer from 'components/LitContainer'
import Toggle from 'components/Toggle'
import ToggleButton from 'components/ToggleButton'

export interface FilterBarProps {
  active: boolean
  setCallActive: Function
}

const FilterBar: React.FC<FilterBarProps> = (props) => {
  const { active, setCallActive } = props

  const handleToggleClick = useCallback(() => {
    setCallActive(!active)
  }, [active, setCallActive])

  return (
    <StyledFilterBar>
      <LitContainer>
        <StyledFilterBarInner>
          <Toggle>
            <ToggleButton
              active={active}
              onClick={handleToggleClick}
              text="Calls"
            />
            <ToggleButton
              active={!active}
              onClick={handleToggleClick}
              text="Puts"
            />
          </Toggle>
        </StyledFilterBarInner>
      </LitContainer>
    </StyledFilterBar>
  )
}

const StyledFilterBar = styled.div`
  background: ${(props) => props.theme.color.grey[800]};
`

const StyledFilterBarInner = styled.div`
  align-items: center;
  display: flex;
  height: ${(props) => props.theme.barHeight}px;
`

export default FilterBar
