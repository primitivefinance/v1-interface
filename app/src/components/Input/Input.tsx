import React, { Fragment } from 'react'
import styled from 'styled-components'

import Spacer from '../Spacer'
import { BigNumberish } from 'ethers'

export interface InputProps {
  endAdornment?: React.ReactNode
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  startAdornment?: React.ReactNode
  value?: BigNumberish
}

const Input: React.FC<InputProps> = ({
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
        <Fragment>
          {startAdornment}
          <Spacer size="sm" />
        </Fragment>
      )}
      <StyledInput
        height={height}
        onChange={onChange}
        placeholder={placeholder}
        value={value.toString()}
      />
      {!!endAdornment && (
        <Fragment>
          <Spacer size="sm" />
          {endAdornment}
          <Spacer size="sm" />
        </Fragment>
      )}
    </StyledInputWrapper>
  )
}

interface StyledInputProps {
  height: number
}

const StyledInputWrapper = styled.div<StyledInputProps>`
  align-items: center;
  background: ${(props) => props.theme.color.black};
  border-radius: ${(props) => props.theme.borderRadius}px;
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
