import React from 'react'
import styled from 'styled-components'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
interface PageHeaderProps {
  icon: React.ReactNode
  subtitle?: string
  title?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ icon, subtitle, title }) => {
  return (
    <StyledPageHeader>
      <StyledIcon>{icon}</StyledIcon>
      <StyledTitle>{title}</StyledTitle>
      <StyledSubtitle>{subtitle}</StyledSubtitle>
    </StyledPageHeader>
  )
}

const StyledPageHeader = styled.div`
  align-items: flex-start;
  justify-content: space-between;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin-top: 2em;
  padding-bottom: ${(props) => props.theme.spacing[6]}px;
`

const StyledIcon = styled.div`
  font-size: 76px;
  height: 66px;
  margin-left: -0.15em;
  z-index: -100;
`

const StyledTitle = styled.h1`
  color: ${(props) => props.theme.color.white};
  font-size: 36px;
  font-weight: 700;
`

const StyledSubtitle = styled.h3`
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 18px;
  font-weight: 400;
  margin: -1em 0 -1em 0;
  padding: 0;
  text-align: center;
`

export default PageHeader
