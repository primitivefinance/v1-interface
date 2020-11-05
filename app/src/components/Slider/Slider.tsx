import React, { Fragment } from 'react'
import styled from 'styled-components'

export interface SliderProps {
  min: number
  max: number
  step?: number
  value?: number
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void
}

const Slider: React.FC<SliderProps> = ({ min, max, value, step, onChange }) => {
  return (
    <StyledContainer>
      <StyledInput
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </StyledContainer>
  )
}

const StyledContainer = styled.div`
  width: 100%;
`

const StyledInput = styled.input`
  -webkit-appearance: none; /* Override default CSS styles */
  appearance: none;
  width: 100%; /* Full-width */
  height: 25px; /* Specified height */
  background: ${(props) => props.theme.color.grey[600]}; /* Grey background */
  border-radius: 1em;
  outline: none; /* Remove outline */
  opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
  -webkit-transition: 0.2s; /* 0.2 seconds transition on hover */
  transition: opacity 0.2s;
  & ::-webkit-slider-thumb {
    -webkit-appearance: none; /* Override default look */
    appearance: none;
    width: 25px; /* Set a specific slider handle width */
    height: 25px; /* Slider handle height */
    background: ${(props) => props.theme.color.white}; /* Green background */
    cursor: pointer; /* Cursor on hover */
  }
`

export default Slider
