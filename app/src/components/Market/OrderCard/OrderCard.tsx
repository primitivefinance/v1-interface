import React, { useEffect } from 'react'

import useOrders from '@/hooks/useOrders'
import CloseIcon from '@material-ui/icons/Close'

import IconButton from '@/components/IconButton'
import Button from '@/components/Button'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import { destructureOptionSymbol } from '@/lib/utils'

import BuyOrMint from './components/BuyOrMint'
import EmptyOrder from './components/EmptyOrder'
import SellOrExercise from './components/SellOrExercise'
import LiquidityPool from './components/LiquidityPool'
import OrderOptions from './components/OrderOptions'

const OrderContent: React.FC = () => {
  const { item, orderType } = useOrders()

  useEffect(() => {}, [item])

  if (orderType === 'BUY' || orderType === 'M_SELL') {
    return <BuyOrMint />
  }
  if (orderType === 'SELL') {
    return <Sell />
  }
  if (orderType === 'M_SELL') {
    return <Short />
  }
  if (orderType === 'LP' || orderType === 'W_LP') {
    return <LiquidityPool />
  }
  if (orderType === 'SELL' || orderType === 'EXEC') return <SellOrExercise />
  if (orderType === '') {
    return <OrderOptions />
  }
}

const OrderCard: React.FC = () => {
  const { item, onChangeItem, onRemoveItem } = useOrders()
  const { asset, month, day, type, strike } = destructureOptionSymbol(item.id)
  const clear = () => {
    onRemoveItem(item)
  }
  if (!item.id) {
    return null
  }
  return (
    <Card>
      <CardTitle>
        Order for{' '}
        {`${asset} ${type === 'C' ? 'Call' : 'Put'} $${strike} ${month}/${day}`}
        <Spacer />
        <IconButton variant="transparent" size="sm" onClick={() => clear()}>
          <CloseIcon />
        </IconButton>
      </CardTitle>
      <OrderContent />
    </Card>
  )
}

export default OrderCard
