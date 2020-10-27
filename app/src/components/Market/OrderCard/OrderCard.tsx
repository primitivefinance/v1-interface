import React, { useEffect } from 'react'
import styled from 'styled-components'

import useOrders from '@/hooks/useOrders'
import CloseIcon from '@material-ui/icons/Close'
import ClearIcon from '@material-ui/icons/Clear'

import IconButton from '@/components/IconButton'
import Button from '@/components/Button'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import { destructureOptionSymbol } from '@/lib/utils'

import Submit from './components/Submit'

import Buy from './components/Buy'
import Sell from './components/Sell'
import Short from './components/Short'
import Test from './components/Test'
import { Exercise } from './components/Exercise'
import { LP, WLP } from './components/LiquidityPool'
import OrderOptions from './components/OrderOptions'
import { Operation } from '@/lib/constants'

const OrderContent: React.FC = () => {
  const { orderType } = useOrders()

  // I know this should be a switch -> yes
  if (orderType === 'BUY') {
    return <Submit orderType={Operation.LONG} />
  }
  if (orderType === 'SELL') {
    return <Submit orderType={Operation.SHORT} />
  }
  if (orderType === 'M_SELL') {
    return <Submit orderType={Operation.EXERCISE} />
  }
  if (orderType === 'TEST') {
    return <Test />
  }
  if (orderType === 'LP') {
    return <Submit orderType={Operation.ADD_LIQUIDITY} />
  }
  if (orderType === 'W_LP') {
    return <Submit orderType={Operation.REMOVE_LIQUIDITY} />
  }
  if (orderType === 'EXEC') {
    return <Submit orderType={Operation.EXERCISE} />
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
        <StyledTitle>
          <>
            {`${asset} ${
              type === 'C' ? 'Call' : 'Put'
            } $${strike} ${month}/${day}`}
          </>
          <StyledFlex />
          <Button variant="transparent" size="sm" onClick={() => clear()}>
            <ClearIcon />
          </Button>
        </StyledTitle>
      </CardTitle>
      <CardContent>
        <OrderContent />
      </CardContent>
    </Card>
  )
}

const StyledTitle = styled(Box)`
  align-items: center;
  border-bottom: 1px solid ${(props) => props.theme.color.grey[600]};
  display: flex;
  flex-direction: row;
  width: 100%;
`

const StyledFlex = styled.div`
  display: flex;
  flex: 1;
`

export default OrderCard
