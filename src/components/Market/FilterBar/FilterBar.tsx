import React, { useCallback } from 'react'
import styled from 'styled-components'

import LitContainer from '@/components/LitContainer'
import Toggle from '@/components/Toggle'
import Label from '@/components/Label'
import ToggleButton from '@/components/ToggleButton'
import Spacer from '@/components/Spacer'
import formatExpiry from '@/utils/formatExpiry'
import { ACTIVE_EXPIRIES } from '@/constants/index'

export interface FilterBarProps {
  active: boolean
  setCallActive: any
  expiry?: number
  setExpiry?: any
}

const FilterBar: React.FC<FilterBarProps> = (props) => {
  const { active, setCallActive, expiry, setExpiry } = props

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
          {/* <StyledSelectWrapper>
            <StyledSelect value={expiry} onChange={handleFilter}>
              {ACTIVE_EXPIRIES.map((expiryValue, i) => {
                return (
                  <StyledOption key={i} value={expiryValue}>
                    {expiryValue >= Date.now() / 1000 ? `Expiring` : 'Expired'}{' '}
                    {formatExpiry(expiryValue).utc}
                  </StyledOption>
                )
              })}
            </StyledSelect>
          </StyledSelectWrapper> */}
        </StyledFilterBarInner>
      </LitContainer>
    </StyledFilterBar>
  )
}

const SelectTitle = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 1em;
`
const StyledFilterBar = styled.div`
  border-radius: 2em;
  margin-left: 1.5em;
  padding: 1em 0 1em 0;
`
const StyledSymbol = styled.h4`
  color: ${(props) => props.theme.color.grey[400]};
  letter-spacing: 1px;
  text-transform: uppercase;
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
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 45%;
`

const StyledSelect = styled.select`
  align-items: center;
  background: ${(props) => props.theme.color.black};
  color: ${(props) => props.theme.color.grey[400]};
  margin-right: ${(props) => props.theme.spacing[7]}px;
  padding: ${(props) => props.theme.spacing[3]}px;
  border-radius: 0.5em;
  width: 100%;
`
const StyledOption = styled.option``

export default FilterBar
