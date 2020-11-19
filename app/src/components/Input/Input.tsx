import React from 'react'
import styled from 'styled-components'

import Spacer from '../Spacer'
import { BigNumberish } from 'ethers'

export interface InputProps {
  name?: string
  endAdornment?: React.ReactNode
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  startAdornment?: React.ReactNode
  value?: string
}

const Input: React.FC<InputProps> = ({
  name,
  endAdornment,
  onChange,
  placeholder,
  size,
  startAdornment,
  value,
}) => {
  let height = 56
  if (size === 'sm') {
    height = 44
  } else if (size === 'lg') {
    height = 72
  }

  return (
    <StyledInputWrapper height={height}>
      {!!startAdornment && (
        <>
          {startAdornment}
          <Spacer size="sm" />
        </>
      )}
      <StyledInput
        name={name}
        height={height}
        onChange={onChange}
        placeholder={placeholder}
        value={value}
      />
      {!!endAdornment && (
        <StyledAd>
          <Spacer size="sm" />
          {endAdornment}
          <Spacer size="sm" />
        </StyledAd>
      )}
    </StyledInputWrapper>
  )
}

const StyledAd = styled.div`
  margin-left: -4em;
`
interface StyledInputProps {
  height: number
}

const StyledInputWrapper = styled.div<StyledInputProps>`
  align-items: center;
  background: ${(props) => props.theme.color.black};
  border-radius: ${(props) => props.theme.borderRadius}px;
  border: 1px solid ${(props) => props.theme.color.grey[600]};
  display: flex;
  height: ${(props) => props.height};
  padding: 0 ${(props) => props.theme.spacing[3]}px;
`

const StyledInput = styled.input<StyledInputProps>`
  background: transparent;
  border: 0;
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
  flex: 1;
  height: ${(props) => props.height}px;
  margin: 0;
  padding: 0;
  outline: none;
  text-indent: ${(props) => props.theme.spacing[3]}px;
`

export default Input
