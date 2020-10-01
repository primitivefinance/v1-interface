import React from 'react'
import styled from 'styled-components'

import Page from 'components/Page'

import OrderProvider from '../../contexts/Order'
import PricesProvider from '../../contexts/Prices'
import OptionsProvider from '../../contexts/Options'
import PositionsProvider from '../../contexts/Positions'

const Portfolio: React.FC = () => {
  return (
    <PricesProvider>
      <OrderProvider>
        <OptionsProvider>
          <PositionsProvider>
            <Page>
              <StyledPortfolio>
                <StyledMain>Soon</StyledMain>
              </StyledPortfolio>
            </Page>
          </PositionsProvider>
        </OptionsProvider>
      </OrderProvider>
    </PricesProvider>
  )
}

const StyledMain = styled.div`
  font-size: 36px;
`

const StyledPortfolio = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
`

export default Portfolio
