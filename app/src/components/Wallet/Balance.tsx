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
        Ξ {amount.toSignificant(4, { groupSeparator: ',' })}
      </StyledText>
    </StyledBalance>
  )
}

const StyledBalance = styled.div`
  color: white;
  width: 3.5em;
`

const StyledText = styled.h4``
