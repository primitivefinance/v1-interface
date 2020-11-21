import React from 'react'
import styled from 'styled-components'

import Box from '../Box'
import Spacer from '../Spacer'
import { BigNumberish } from 'ethers'

import IconButton from '@/components/IconButton'

import { useClickAway } from '@/hooks/utils/useClickAway'

import AddIcon from '@material-ui/icons/Add'
import LaunchIcon from '@material-ui/icons/Launch'
import CheckIcon from '@material-ui/icons/Check'
import { Container } from '@material-ui/core'
import ClearIcon from '@material-ui/icons/Clear'

export interface InputProps {
  name?: string
  endAdornment?: React.ReactNode
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  startAdornment?: React.ReactNode
  value?: string
  valid?: boolean
}

export interface ValidatedProps {
  valid: boolean
}

const Validated: React.FC<ValidatedProps> = ({ valid }) => {
  return (
    <StyledIcon variant={valid ? 'default' : 'transparent'}>
      {valid ? <CheckIcon /> : <ClearIcon />}
    </StyledIcon>
  )
}

const Input: React.FC<InputProps> = ({
  name,
  endAdornment,
  onChange,
  placeholder,
  size,
  startAdornment,
  value,
  valid,
}) => {
  let height = 56
  if (size === 'sm') {
    height = 44
  } else if (size === 'lg') {
    height = 72
  }

  return (
    <Box row alignItems="center" justifyContent="space-between">
      <StyledInputWrapper height={height}>
        {!!startAdornment && (
          <>
            {startAdornment}
            <Spacer size="sm" />
          </>
        )}
        <StyledInput
          name={name}
          type="number"
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

      {typeof valid !== 'undefined' && (
        <>
          <Spacer size="sm" />
          <Validated valid={valid} />{' '}
        </>
      )}
    </Box>
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
  padding: 0 ${(props) => props.theme.spacing[2]}px;
  width: 100%;
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

interface StyledIconProps {
  variant: string
}

const StyledIcon = styled.div<StyledIconProps>`
  align-items: center;
  background: ${(props) =>
    props.variant === 'default' ? props.theme.color.white : 'transparent'};
  border: 2px solid ${(props) => props.theme.color.grey[800]};
  border-radius: 36px;
  box-sizing: border-box;
  color: ${(props) =>
    props.variant === 'default'
      ? props.theme.color.black
      : props.theme.color.white};
  display: flex;
  height: 36px;
  justify-content: center;
  letter-spacing: 0.5px;
  margin: 0;
  min-width: 36px;
  outline: none;
  padding-left: 0px;
  padding-right: 0px;
`

export default Input
