import React from 'react'
import styled from 'styled-components'

import OrderProvider from '@/contexts/Order'
import OptionsProvider from '@/contexts/Options'

const Portfolio: React.FC = () => {
  return (
    <OrderProvider>
      <OptionsProvider>
        <StyledPortfolio>
          <StyledMain>Upcoming Feature...</StyledMain>
        </StyledPortfolio>
      </OptionsProvider>
    </OrderProvider>
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
