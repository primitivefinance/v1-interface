import React from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'

export interface BalanceProps {
  amount: any
}

export const Balance: React.FC<BalanceProps> = ({ amount }) => {
  if (amount === undefined) return <></>
  return (
    <StyledContent>
      <StyledText>
        Ξ {amount.toSignificant(4, { groupSeparator: ',' })}
      </StyledText>
    </StyledContent>
  )
}

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const StyledText = styled.h4`
  color: ${(props) => props.theme.color.white};
  font-weight: 700;
  padding: 0;
`
