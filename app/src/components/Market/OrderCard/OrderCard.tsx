import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { useItem, useUpdateItem, useRemoveItem } from '@/state/order/hooks'
import { useOptions } from '@/state/options/hooks'
import ClearIcon from '@material-ui/icons/Clear'

import Button from '@/components/Button'
import Spacer from '@/components/Spacer'

import Box from '@/components/Box'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import Submit from './components/Submit'
import OrderOptions from './components/OrderOptions'
import formatBalance from '@/utils/formatBalance'
import formatExpiry from '@/utils/formatExpiry'
import {
  Operation,
  getIconForMarket,
  COINGECKO_ID_FOR_MARKET,
} from '@/constants/index'
import { EmptyAttributes } from '@/state/options/reducer'

const OrderContent: React.FC = () => {
  const { orderType } = useItem()

  if (orderType !== Operation.NONE) {
    return <Submit orderType={orderType} />
  }
  if (orderType === Operation.NONE) {
    return <OrderOptions />
  }
}

export interface OrderProps {
  orderState: any
}

const OrderCard: React.FC<OrderProps> = ({ orderState }) => {
  const { item } = useItem()
  const removeItem = useRemoveItem()
  const updateItem = useUpdateItem()
  const options = useOptions()
  const router = useRouter()
  useEffect(() => {
    if (orderState[1] && orderState[2]) {
      if (!options.loading) {
        const opts = options.calls.concat(options.puts)
        opts.map((opt) => {
          if (opt.address === orderState[1]) {
            // force ts compiler
            const id: string = orderState[2]
            updateItem(opt, Operation[id])
            setTimeout(() => {
              router.push(
                `/markets/[...id]`,
                `/markets/${options.calls[0].asset.toLowerCase()}`,
                {
                  shallow: true,
                }
              )
            }, 1000)
          }
        })
      }
    }
  }, [orderState, updateItem, options])
  if (!item.expiry) {
    return null
  }
  const { date, month, year } = formatExpiry(item.expiry)
  const clear = () => {
    removeItem()
  }
  return (
    <Card>
      <Box row justifyContent="space-between" alignItems="center">
        <StyledLogo src={getIconForMarket(item.asset.toLowerCase())} alt={''} />
        <div>
          <StyledTitle>
            {`${item.asset} ${item.entity.isCall ? 'Call' : 'Put'}`}
          </StyledTitle>
          <Reverse />
          <StyledTitle>
            {`$${formatBalance(item.strike)} ${month}/${date} ${year}`}
          </StyledTitle>
        </div>
        <Spacer />
        <CustomButton>
          <Button variant="transparent" size="sm" onClick={() => clear()}>
            <ClearIcon />
          </Button>
        </CustomButton>
      </Box>
      <CardContent>
        <OrderContent />
      </CardContent>
    </Card>
  )
}

const CustomButton = styled.div`
  margin-top: -1.1em;
  background: none;
`
const Reverse = styled.div`
  margin-top: -1.1em;
`

const StyledTitle = styled.h4`
  align-items: center;
  border-bottom: 0px solid ${(props) => props.theme.color.grey[600]};
  width: 100%;
  color: white;
`

const StyledLogo = styled.img`
  border-radius: 50%;
  margin-left: 1.3em;
  height: 36px;
`

export default OrderCard
