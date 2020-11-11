import React from 'react'
import styled from 'styled-components'

const Portfolio: React.FC = () => {
  return (
    <StyledPortfolio>
      <StyledMain>Upcoming Feature...</StyledMain>
    </StyledPortfolio>
  )
}

const StyledMain = styled.div`
  font-size: 36px;
  color: ${(props) => props.theme.color.grey[400]};
`

const StyledPortfolio = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
`

export default Portfolio
