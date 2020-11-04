import React from 'react'
import styled from 'styled-components'

import useOrders from '@/hooks/useOrders'
import ClearIcon from '@material-ui/icons/Clear'

import Button from '@/components/Button'
import Box from '@/components/Box'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import { destructureOptionSymbol } from '@/lib/utils'

import Submit from './components/Submit'
import Test from './components/Test'
import OrderOptions from './components/OrderOptions'
import { Operation } from '@/lib/constants'

const OrderContent: React.FC = () => {
  const { orderType } = useOrders()

  // I know this should be a switch -> yes
  if (orderType === 'LONG') {
    return <Submit orderType={Operation.LONG} />
  }
  if (orderType === 'SHORT') {
    return <Submit orderType={Operation.SHORT} />
  }
  if (orderType === 'TEST') {
    return <Test />
  }
  if (orderType === 'ADD_LIQUIDITY') {
    return <Submit orderType={Operation.ADD_LIQUIDITY} />
  }
  if (orderType === 'REMOVE_LIQUIDITY') {
    return <Submit orderType={Operation.REMOVE_LIQUIDITY} />
  }
  if (orderType === 'REMOVE_LIQUIDITY_CLOSE') {
    return <Submit orderType={Operation.REMOVE_LIQUIDITY_CLOSE} />
  }
  if (orderType === 'EXEC') {
    return <Submit orderType={Operation.EXERCISE} />
  }
  if (orderType === 'CLOSE_LONG') {
    return <Submit orderType={Operation.CLOSE_LONG} />
  }
  if (orderType === 'CLOSE_SHORT') {
    return <Submit orderType={Operation.CLOSE_SHORT} />
  }
  if (orderType === '') {
    return <OrderOptions />
  }
}

const OrderCard: React.FC = () => {
  const { item, onRemoveItem } = useOrders()
  if (!item.id) {
    return null
  }
  const exp = new Date(parseInt(item.expiry.toString()) * 1000)
  const clear = () => {
    onRemoveItem(item)
  }
  console.log(item.id)
  return (
    <Card>
      <CardTitle>
        <StyledTitle>
          <>
            {`${item.asset} ${item.isCall ? 'Call' : 'Put'} $${
              item.strike
            } ${exp.getMonth()}/${exp.getDay()} ${exp.getFullYear()}`}
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
