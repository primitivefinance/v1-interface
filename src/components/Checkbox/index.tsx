import React from 'react'
import styled from 'styled-components'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'

interface CheckboxProps {
  active?: boolean
  onClick?: any
}

const Checkbox: React.FC<CheckboxProps> = ({ active, onClick }) => {
  return (
    <StyledContainer onClick={onClick}>
      <StyledCheck>
        {active ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
      </StyledCheck>
    </StyledContainer>
  )
}

const StyledContainer = styled.button`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
`

const StyledCheck = styled.div`
  position: absolute;
`
export default Checkbox
