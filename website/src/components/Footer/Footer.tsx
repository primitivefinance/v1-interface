import React from 'react'
import styled from 'styled-components'

import { Spacer, useTheme } from 'react-neu'

const Footer: React.FC = () => {
  const { siteWidth } = useTheme()
  return (
    <StyledFooter>
      <Spacer size="md" />
      <StyledContainer width={siteWidth}>
        <StyledLink href="https://discord.gg/JBM6APT">Discord</StyledLink>
        <StyledLink href="https://github.com/primitivefinance">
          Github
        </StyledLink>
        <StyledLink href="https://twitter.com/primitivefi">Twitter</StyledLink>
      </StyledContainer>
      <Spacer size="md" />
    </StyledFooter>
  )
}

interface StyledContainerProps {
  width: number
}

const StyledContainer = styled.div<StyledContainerProps>`
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  margin: 0 auto;
  max-width: ${props => props.width}px;
  padding: 0 ${props => props.theme.spacing[4]}px;
  width: 100%;
`

const StyledFooter = styled.div`
  background-color: ${props => props.theme.colors.grey[300]};
`

const StyledLink = styled.a`
  color: ${props => props.theme.colors.grey[500]};
  padding-left: ${props => props.theme.spacing[3]}px;
  padding-right: ${props => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${props => props.theme.colors.grey[600]};
  }
`

export default Footer
