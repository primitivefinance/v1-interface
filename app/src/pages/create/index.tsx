import React, { useEffect } from 'react'
import styled from 'styled-components'

import Button from '@/components/Button'
import Spacer from '@/components/Spacer'

import OrderProvider from '@/contexts/Order'
import PricesProvider from '@/contexts/Prices'
import OptionsProvider from '@/contexts/Options'
import PositionsProvider from '@/contexts/Positions'

const Create: React.FC = () => {
  return (
    <PricesProvider>
      <OrderProvider>
        <OptionsProvider>
          <PositionsProvider>
            <StyledCreate>
              <StyledMain>
                <StyledText>
                  Primitive is permissionless; anyone can create new Oracle-less
                  options from the {`protocol's`} factory. The interface is
                  being built.
                </StyledText>
              </StyledMain>
            </StyledCreate>
          </PositionsProvider>
        </OptionsProvider>
      </OrderProvider>
    </PricesProvider>
  )
}

const StyledMain = styled.div`
  font-size: 36px;
`

const StyledText = styled.div`
  font-size: 18px;
  color: ${(props) => props.theme.color.grey[400]};
`

const StyledCreate = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
`

export default Create
