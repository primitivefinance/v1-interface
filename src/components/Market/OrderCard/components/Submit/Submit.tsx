import React, { useEffect } from 'react'
import styled from 'styled-components'
import { AddLiquidity } from '../AddLiquidity'
import { RemoveLiquidity } from '../RemoveLiquidity'
import { Swap } from '../Swap'
import { Manage } from '../Manage'
import { Operation } from '@/constants/index'

import { useItem, useUpdateItem } from '@/state/order/hooks'
export interface SubmitProps {
  orderType: Operation
}

const Submit: React.FC<SubmitProps> = () => {
  const { item, orderType } = useItem()
  const updateItem = useUpdateItem()

  let manage = false
  switch (orderType) {
    case Operation.MINT:
      manage = true
      break
    case Operation.EXERCISE:
      manage = true
      break
    case Operation.REDEEM:
      manage = true
      break
    case Operation.CLOSE:
      manage = true
      break
    default:
      break
  }

  return (
    <StyledDiv>
      {orderType === Operation.ADD_LIQUIDITY ||
      orderType === Operation.ADD_LIQUIDITY_CUSTOM ? null : orderType ===
          Operation.REMOVE_LIQUIDITY_CLOSE ||
        orderType === Operation.REMOVE_LIQUIDITY ? null : manage ? (
        <Manage />
      ) : (
        <>
          <Swap />
        </>
      )}
    </StyledDiv>
  )
}

const StyledDiv = styled.div`
  padding: 0.4em;
  //background: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  //border: 1px solid ${(props) => props.theme.color.grey[600]};
  //border-radius: 10px;
`

export default Submit
