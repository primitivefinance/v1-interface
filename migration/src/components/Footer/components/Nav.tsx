import React from 'react'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink href="https://discord.gg/JBM6APT">
        <img
          height="24px"
          width="24px"
          alt="discord logo"
          src={
            'https://discord.com/assets/28174a34e77bb5e5310ced9f95cb480b.png'
          }
        />
      </StyledLink>
      <StyledLink href="https://github.com/primitivefinance">
        <img
          height="24px"
          width="24px"
          alt="discord logo"
          src={'https://avatars1.githubusercontent.com/u/9919?s=200&v=4'}
        />
      </StyledLink>
      <StyledLink href="https://twitter.com/primitivefi">
        <img
          height="20px"
          width="24px"
          alt="discord logo"
          style={{ filter: 'brightness(0) invert(1) ' }}
          src={
            'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Twitter_bird_logo_2012.svg/1280px-Twitter_bird_logo_2012.svg.png'
          }
        />
      </StyledLink>
    </StyledNav>
  )
}

const StyledNav = styled.nav`
  display: flex;
`

const StyledLink = styled.a`
  align-items: center;
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  height: 44px;
  justify-content: center;
  &:hover {
    color: ${(props) => props.theme.color.grey[500]};
  }
  text-decoration: none;
  width: 44px;
`

export default Nav