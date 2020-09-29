import React from 'react'
import styled from 'styled-components'

import { Spacer, useTheme } from 'react-neu'

const Footer: React.FC = () => {
  const { siteWidth } = useTheme()
  return (
    <StyledFooter>
      <Spacer size="md" />
      <StyledContainer width={siteWidth}>
        <StyledLink href="https://discord.gg/JBM6APT">
          <img
            height="24px"
            alt="discord logo"
            src={
              'https://discord.com/assets/41484d92c876f76b20c7f746221e8151.svg'
            }
          />
        </StyledLink>
        <StyledLink href="https://github.com/primitivefinance">
          <img
            height="24px"
            alt="github logo"
            src={
              'https://www.iconfinder.com/data/icons/octicons/1024/mark-github-512.png'
            }
          />
        </StyledLink>
        <StyledLink href="https://twitter.com/primitivefi">
          <img
            height="24px"
            alt="twitter logo"
            style={{ filter: 'brightness(0) ' }}
            src={
              'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Twitter_bird_logo_2012.svg/1280px-Twitter_bird_logo_2012.svg.png'
            }
          />
        </StyledLink>
        <StyledLink href="https://medium.com/@primitivefinance">
          <img
            height="24px"
            alt="medium logo"
            src={'https://miro.medium.com/max/195/1*emiGsBgJu2KHWyjluhKXQw.png'}
          />
        </StyledLink>
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
