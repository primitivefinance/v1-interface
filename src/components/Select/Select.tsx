import React from 'react'
import styled from 'styled-components'

export type SelectattedSelections = {
  selections: string
}

export interface SelectProps {
  children: any
}

const Select: React.FC<SelectProps> = ({ children }) => {
  return (
    <StyledSelect>
      <StyledOption>{children}</StyledOption>
    </StyledSelect>
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

export default Select
