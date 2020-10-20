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
      <Box row alignItems="center" justifyContent="center">
        <h4>{amount.toSignificant(4, { groupSeparator: ',' })} ETH</h4>
      </Box>
    </StyledBalance>
  )
}

const StyledBalance = styled.div`
  align-items: center;
  justify-content: center;
  color: white;
  border-radius: 0.3em;
  margin-top: 1em;
`

const StyledText = styled.h4``
