import React, { useCallback } from 'react'
import styled from 'styled-components'

import LitContainer from '@/components/LitContainer'
import Toggle from '@/components/Toggle'
import ToggleButton from '@/components/ToggleButton'
import Spacer from '@/components/Spacer'

export interface FilterBarProps {
  active: boolean
  setCallActive: any
  expiry: number
  setExpiry: any
}

const FilterBar: React.FC<FilterBarProps> = (props) => {
  const { active, setCallActive, expiry, setExpiry } = props

  const handleToggleClick = useCallback(() => {
    setCallActive(!active)
  }, [active, setCallActive])

  const handleFilter = (event: any) => {
    setExpiry(event.target.value)
  }
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
          <StyledSelectWrapper>
            <StyledSelect value={expiry} onChange={handleFilter}>
              <StyledOption>December 30th, 2020</StyledOption>
            </StyledSelect>
          </StyledSelectWrapper>
        </StyledFilterBarInner>
      </LitContainer>
    </StyledFilterBar>
  )
}

const StyledFilterBar = styled.div`
  background: ${(props) => props.theme.color.black};
  border-radius: 2em;
  padding: 1em;
`

const StyledFilterBarInner = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  height: ${(props) => props.theme.barHeight}px;
`
const StyledSelectWrapper = styled.div`
  padding: 1em;
  border-radius: 1em;
  width: 40%;
`

const StyledSelect = styled.select`
  align-items: center;
  background: ${(props) => props.theme.color.grey[800]};
  color: ${(props) => props.theme.color.grey[400]};
  margin-right: ${(props) => props.theme.spacing[7]}px;
  padding: ${(props) => props.theme.spacing[3]}px;
  width: 100%;
`
const StyledOption = styled.option``

export default FilterBar
