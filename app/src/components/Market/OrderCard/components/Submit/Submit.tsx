import React from 'react'
import { AddLiquidity } from '../AddLiquidity'
import { Swap } from '../Swap'
import { Operation } from '@/constants/index'

import { useItem } from '@/state/order/hooks'
export interface SubmitProps {
  orderType: Operation
}

const Submit: React.FC<SubmitProps> = () => {
  const { orderType } = useItem()
  return (
    <>
      {orderType === Operation.ADD_LIQUIDITY ? (
        <AddLiquidity />
      ) : (
        <>
          <Swap />
        </>
      )}
    </>
  )
}

export default Submit
