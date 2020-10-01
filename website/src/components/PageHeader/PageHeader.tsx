import React from 'react'
import styled from 'styled-components'
import { Container, Spacer } from 'react-neu'

import H1 from 'components/H1'
import Subtitle from 'components/Subtitle'

interface PageHeaderProps {
  icon: React.ReactNode
  subtitle?: string
  title?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ icon, subtitle, title }) => {
  return (
    <Container>
      <StyledPageHeader>
        <StyledIcon>{icon}</StyledIcon>
        <H1>{title}</H1>
        <Spacer />
        <Subtitle>{subtitle}</Subtitle>
      </StyledPageHeader>
    </Container>
  )
}

const StyledIcon = styled.span.attrs({
  role: 'img',
})`
  font-size: 96px;
  min-height: 96px;
  line-height: 96px;
  text-align: center;
  min-width: 96px;
  @media (max-width: 768px) {
    font-size: 64px;
    text-align: left;
  }
`

const StyledPageHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding-bottom: ${props => props.theme.spacing[6]}px;
  margin: 0 auto;
`

export default PageHeader
