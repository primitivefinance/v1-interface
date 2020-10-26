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

import Buy from './components/Buy'
import Sell from './components/Sell'
import Short from './components/Short'
import Test from './components/Test'
import { Exercise } from './components/Exercise'
import { LP, WLP } from './components/LiquidityPool'
import OrderOptions from './components/OrderOptions'

const OrderContent: React.FC = () => {
  const { orderType } = useOrders()

  // I know this should be a switch
  if (orderType === 'BUY') {
    return <Buy />
  }
  if (orderType === 'SELL') {
    return <Sell />
  }
  if (orderType === 'M_SELL') {
    return <Short />
  }
  if (orderType === 'TEST') {
    return <Test />
  }
  if (orderType === 'LP') {
    return <LP />
  }
  if (orderType === 'W_LP') {
    return <WLP />
  }
  if (orderType === 'EXEC') {
    return <Exercise />
  }
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
        <Box row justifyContent="center" alignItems="center">
          <>
            {`${asset} ${
              type === 'C' ? 'Call' : 'Put'
            } $${strike} ${month}/${day}`}
          </>
          <Button variant="tertiary" size="sm" onClick={() => clear()}>
            cancel
          </Button>
        </Box>
      </CardTitle>
      <CardContent>
        <OrderContent />
      </CardContent>
    </Card>
  )
}

export default OrderCard
