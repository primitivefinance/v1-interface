import React, { useEffect } from 'react'

import useOrders from '@/hooks/useOrders'

import BuyOrMint from './components/BuyOrMint'
import EmptyOrder from './components/EmptyOrder'
import SellOrExercise from './components/SellOrExercise'
import LiquidityPool from './components/LiquidityPool'

const OrderCard: React.FC = () => {
  const { item, orderType } = useOrders()

  useEffect(() => {}, [item])

  if (!item.id) {
    return <EmptyOrder />
  }

  if (orderType === 'BUY' || orderType === 'MINT') {
    return <BuyOrMint />
  }
  if (orderType === 'LP' || orderType === 'W_LP') {
    return <LiquidityPool />
  }
  return <SellOrExercise />
}

export default OrderCard
