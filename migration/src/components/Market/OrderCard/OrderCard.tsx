import React, { useEffect } from 'react'

import useOrders from '@/hooks/useOrders'

import BuyOrMint from './components/BuyOrMint'
import EmptyOrder from './components/EmptyOrder'
import SellOrExercise from './components/SellOrExercise'

const OrderCard: React.FC = () => {
  const { item, orderType, loadPendingTx } = useOrders()

  const { buyOrMint } = orderType

  useEffect(() => {}, [item])

  useEffect(() => {
    ;(async () => {
      loadPendingTx()
    })()
  }, [loadPendingTx])

  if (!item.id) {
    return <EmptyOrder />
  }

  if (buyOrMint) {
    return <BuyOrMint />
  }

  return <SellOrExercise />
}

export default OrderCard
