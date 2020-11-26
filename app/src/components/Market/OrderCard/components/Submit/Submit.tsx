import React from 'react'
import styled from 'styled-components'
import { AddLiquidity } from '../AddLiquidity'
import { RemoveLiquidity } from '../RemoveLiquidity'
import { Swap } from '../Swap'
import { Operation } from '@/constants/index'

import { useItem } from '@/state/order/hooks'
export interface SubmitProps {
  orderType: Operation
}

const Submit: React.FC<SubmitProps> = () => {
  const { orderType } = useItem()
  return (
    <StyledDiv>
      {orderType === Operation.ADD_LIQUIDITY ? (
        <AddLiquidity />
      ) : orderType === Operation.REMOVE_LIQUIDITY_CLOSE ? (
        <RemoveLiquidity />
      ) : (
        <>
          <Swap />
        </>
      )}
    </StyledDiv>
  )
}

const StyledDiv = styled.div`
  padding: 1em;
  background: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid ${(props) => props.theme.color.grey[600]};
  border-radius: 10px;
`

export default Submit
