import React, { useCallback } from 'react'
import styled from 'styled-components'

import LitContainer from 'components/LitContainer'
import Toggle from 'components/Toggle'
import ToggleButton from 'components/ToggleButton'
import Spacer from 'components/Spacer'

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
          <Spacer size="lg" />
          <StyledSelect>
            <StyledOption>November 2</StyledOption>
          </StyledSelect>
        </StyledFilterBarInner>
      </LitContainer>
    </StyledFilterBar>
  )
}

const StyledSelect = styled.select`
  align-items: center;
  display: flex;
  border-radius: ${(props) => props.theme.borderRadius}px;
  border: none;
  background: ${(props) => props.theme.color.black};
  color: ${(props) => props.theme.color.grey[400]};
  padding: ${(props) => props.theme.spacing[3]}px;
  width: calc(
    (100vw - ${(props) => props.theme.contentWidth}px) / 2 +
      ${(props) => props.theme.contentWidth * (2 / 3)}px
  );
  margin-right: ${(props) => props.theme.spacing[7]}px;
`
const StyledOption = styled.option``

const StyledFilterBar = styled.div`
  background: ${(props) => props.theme.color.grey[800]};
`

const StyledFilterBarInner = styled.div`
  align-items: center;
  display: flex;
  height: ${(props) => props.theme.barHeight}px;
`

export default FilterBar
