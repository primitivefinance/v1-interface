import React from 'react'
import styled from 'styled-components'

interface PageProps {
  children: any
  full?: boolean
}

const Page: React.FC<PageProps> = (props) => (
  <StyledPage>
    <StyledMain full={props.full}>{props.children}</StyledMain>
  </StyledPage>
)

const StyledPage = styled.div``

interface StyledMainProps {
  full?: boolean
}

const StyledMain = styled.div<StyledMainProps>`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
  width: 100%;
`

export default Page
