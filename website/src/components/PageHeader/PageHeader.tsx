import React from 'react'
import styled from 'styled-components'
import { Container, Spacer } from 'react-neu'

interface PageHeaderProps {
  icon: React.ReactNode
  subtitle?: string
  title?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ icon, subtitle, title }) => {
  return (
    <Container>
      <StyledPageHeader>
        <StyledTitle>{title}</StyledTitle>
        <Spacer />
        <StyledSubtitle>{subtitle}</StyledSubtitle>
      </StyledPageHeader>
    </Container>
  )
}

const StyledPageHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding-bottom: ${props => props.theme.spacing[6]}px;
  margin: 0 auto;
`

const StyledTitle = styled.h1`
  color: ${props => props.theme.textColor};
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  padding: 0;
  text-align: center;
  @media (max-width: 768px) {
    text-align: left;
  }
`

const StyledSubtitle = styled.h1`
  color: ${props => props.theme.textColor};
  font-size: 18px;
  font-weight: 400;
  margin: 0;
  opacity: 0.66;
  padding: 0;
  text-align: center;
  @media (max-width: 768px) {
    text-align: left;
  }
`

export default PageHeader
