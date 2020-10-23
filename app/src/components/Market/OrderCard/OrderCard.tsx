import React, { useEffect } from 'react'

import useOrders from '@/hooks/useOrders'

import BuyOrMint from './components/BuyOrMint'
import EmptyOrder from './components/EmptyOrder'
import SellOrExercise from './components/SellOrExercise'
import useTransactions from '@/hooks/transactions'

const OrderCard: React.FC = () => {
  const { item, orderType } = useOrders()
  const { transactions } = useTransactions()
  const { buyOrMint } = orderType

  useEffect(() => {}, [item])

  if (!item.id) {
    return <EmptyOrder />
  }

  if (buyOrMint) {
    return <BuyOrMint />
  }

  return <SellOrExercise />
}

export default OrderCard
