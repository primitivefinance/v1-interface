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
import { OrderItem, NewOptionItem } from '@/contexts/Order/types'
import { Operation } from '@/lib/constants'

const NewMarketCard: React.FC = () => {
  const { item, onRemoveItem } = useOrders()
  const clear = () => {
    onRemoveItem(item)
  }

  const isOrderItem = (x: OrderItem | NewOptionItem): x is OrderItem => {
    if (!(x as OrderItem).id) {
      return true
    }
    return false
  }
  if (!item.asset) {
    return null
  }
  return (
    <Card>
      <CardTitle>
        <StyledTitle>
          <>{item.asset}</>
          <>{item.expiry}</>
          <StyledFlex />
          <Button variant="transparent" size="sm" onClick={() => clear()}>
            <ClearIcon />
          </Button>
        </StyledTitle>
      </CardTitle>
      <CardContent>HERE</CardContent>
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

export default NewMarketCard
