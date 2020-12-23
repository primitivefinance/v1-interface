import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import Button from '@/components/Button'
export interface GoBackProps {
  text?: string
  to?: string
}

const GoBack: React.FC<GoBackProps> = (props) => {
  return (
    <StyledGoBack>
      <ChevronLeftIcon />
      <StyledLink href={props.to ? props.to : '/markets'}>
        <h5>{props.text ? props.text : 'Back'}</h5>
      </StyledLink>
    </StyledGoBack>
  )
}

const StyledText = styled.h6`
  color: ${(props) => props.theme.color.grey[400]};
  &:hover {
    color: ${(props) => props.theme.color.grey[600]};
  }
  margin: -1em 0 -1em 0;
`

const StyledGoBack = styled.div`
  align-items: center;
  background: transparent;
  border: 0px;
  color: ${(props) => props.theme.color.grey[400]};
  cursor: pointer;
  display: flex;
  font-size: 18px;
  width: 3em;
  margin: -1em 0 -1em -0.6em;
  padding: 0;
  &:hover {
    color: ${(props) => props.theme.color.white};
  }
  text-decoration: none;
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
