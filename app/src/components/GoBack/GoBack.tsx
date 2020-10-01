import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

export interface GoBackProps {
  text?: string
  to?: string
}

const GoBack: React.FC<GoBackProps> = (props) => {
  return (
    <StyledGoBack>
      <ChevronLeftIcon />
      <StyledLink to={props.to ? props.to : '/markets'}>
        <span>{props.text ? props.text : 'Back'}</span>
      </StyledLink>
    </StyledGoBack>
  )
}

const StyledGoBack = styled.button`
  align-items: center;
  background: transparent;
  border: 0px;
  color: ${(props) => props.theme.color.grey[400]};
  cursor: pointer;
  display: flex;
  font-size: 14px;
  margin: 0;
  padding: 0;
  &:hover {
    color: ${(props) => props.theme.color.white};
  }
`

const StyledLink = styled(Link)`
  align-items: center;
  color: inherit;
  display: flex;
  flex: 1;
  height: 100%;
  justify-content: center;
  margin: 0 ${(props) => -props.theme.spacing[4]}px;
  padding: 0 ${(props) => props.theme.spacing[4]}px;
  text-decoration: none;
`

export default GoBack
