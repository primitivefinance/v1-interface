import React from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'

export interface BalanceProps {
  amount: any
}

export const Balance: React.FC<BalanceProps> = ({ amount }) => {
  if (amount === undefined) return <></>
  return (
    <StyledBalance>
      <StyledText>
        {amount.toSignificant(4, { groupSeparator: ',' })} ETH
      </StyledText>
    </StyledBalance>
  )
}

const StyledBalance = styled.div`
  color: white;
  width: 5em;
  min-width: 5em;
`

const StyledText = styled.h5``
