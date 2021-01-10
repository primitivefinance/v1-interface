import React, { useEffect } from 'react'
import styled from 'styled-components'
import FaqTable from '@/components/FaqTable'
import Spacer from '@/components/Spacer'

const FAQ: React.FC = () => {
  return (
    <>
      <Spacer></Spacer>
      <FaqTable />
    </>
  )
}

const StyledNavItem = styled.span`
  color: ${(props) => props.theme.color.grey[300]};
  cursor: pointer;
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.color.white};
  }
`

interface StyledSpacerProps {
  size: number
}

const StyledSpacer = styled.div<StyledSpacerProps>`
  height: ${(props) => props.size}px;
  min-height: ${(props) => props.size}px;
  min-width: ${(props) => props.size}px;
  width: ${(props) => props.size}px;
`

const StyledTitle = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: ${(props) => props.theme.color.white};
`

const StyledSubtitle = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: ${(props) => props.theme.color.white};
`

const StyledText = styled.div`
  font-size: 18px;
  color: ${(props) => props.theme.color.grey[400]};
`

const StyledFAQ = styled.div`
  align-items: left;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
  width: calc(100vh - ${(props) => (props.theme.barHeight * 2) / 3}px);
`

export default FAQ
