import React from 'react'
import styled from 'styled-components'
import Toggle from '@/components/Toggle'
import ToggleButton from '@/components/ToggleButton'

interface SwitchProps {
  active: boolean
  onClick: () => void
}

const Switch: React.FC<SwitchProps> = ({ active, onClick }) => {
  return (
    <StyledToggleContainer>
      <StyledFilterBarInner>
        <Toggle full>
          <ToggleButton active={active} onClick={onClick} text="Buy" />
          <ToggleButton active={!active} onClick={onClick} text="Sell" />
        </Toggle>
      </StyledFilterBarInner>
    </StyledToggleContainer>
  )
}

const StyledToggleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`

const StyledFilterBarInner = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  height: ${(props) => props.theme.barHeight}px;
  width: 100%;
`

export default Switch
