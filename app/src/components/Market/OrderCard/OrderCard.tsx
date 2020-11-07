import React from 'react'
import styled from 'styled-components'

import useOrders from '@/hooks/useOrders'
import ClearIcon from '@material-ui/icons/Clear'

import Button from '@/components/Button'
import Box from '@/components/Box'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import Submit from './components/Submit'
import OrderOptions from './components/OrderOptions'
import formatBalance from '@/utils/formatBalance'

const OrderContent: React.FC = () => {
  const { orderType } = useOrders()

  if (orderType !== null) {
    return <Submit orderType={orderType} />
  }
  if (orderType === null) {
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
  return (
    <Card>
      <CardTitle>
        <StyledTitle>
          <>
            {`${item.asset} ${item.isCall ? 'Call' : 'Put'} $${formatBalance(
              item.strike
            )} ${exp.getMonth()}/${exp.getDay()} ${exp.getFullYear()}`}
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
