import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { useItem, useUpdateItem, useRemoveItem } from '@/state/order/hooks'
import { useOptions } from '@/state/options/hooks'
import ClearIcon from '@material-ui/icons/Clear'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import LaunchIcon from '@material-ui/icons/Launch'

import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import Spacer from '@/components/Spacer'
import Tooltip from '@/components/Tooltip'
import ErrorBoundary from '@/components/ErrorBoundary'

import Box from '@/components/Box'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import Submit from './components/Submit'
import OrderOptions from './components/OrderOptions'
import ManageOptions from './components/ManageOptions'
import formatBalance from '@/utils/formatBalance'
import formatExpiry from '@/utils/formatExpiry'
import {
  Operation,
  ETHERSCAN_MAINNET,
  ETHERSCAN_RINKEBY,
} from '@/constants/index'
import numeral from 'numeral'

export interface OrderContentProps {
  manage: boolean
}

const OrderContent: React.FC<OrderContentProps> = () => {
  const { orderType } = useItem()

  if (orderType !== Operation.NONE) {
    return <Submit orderType={orderType} />
  }
  if (orderType === Operation.NONE) {
    return (
      <>
        <OrderOptions />
      </>
    )
  }
}

export interface OrderProps {
  orderState: any
}

const OrderCard: React.FC<OrderProps> = ({ orderState }) => {
  const [manage, setManage] = useState(false)
  const { item, orderType, loading } = useItem()
  const removeItem = useRemoveItem()
  const updateItem = useUpdateItem()
  const options = useOptions()
  const router = useRouter()
  useEffect(() => {
    if (
      orderType === Operation.MINT ||
      orderType === Operation.EXERCISE ||
      orderType === Operation.REDEEM ||
      orderType === Operation.CLOSE
    ) {
      setManage(false)
    }
  }, [orderType])
  useEffect(() => {
    if (!options.loading) {
      if (orderState[1] && orderState[2] && orderState[3]) {
        const opts = options.calls.concat(options.puts)
        opts.map(async (opt) => {
          if (opt.entity.address === orderState[2]) {
            // force ts compiler
            const id: string = orderState[3]
            updateItem(opt, Operation[id])
          }
        })
      }
      setTimeout(() => {
        const market = options.calls[0].asset.toLowerCase()
        router.push(
          `/markets/[...id]`,
          `/markets/${market}/${orderState[1] === 'puts' ? 'puts' : 'calls'}`,
          {
            shallow: true,
          }
        )
      }, 1000)
    }
  }, [orderState, updateItem, options])
  if (!item.entity || !item.entity?.expiryValue) {
    return null
  }
  const { date, month, year } = formatExpiry(item.entity.expiryValue)
  const clear = () => {
    removeItem()
  }
  const baseUrl =
    item.market.liquidityToken.chainId === 4
      ? ETHERSCAN_RINKEBY
      : ETHERSCAN_MAINNET
  return (
    <>
      <Card border>
        <CardContent>
          {loading ? <LoadingOverlay></LoadingOverlay> : null}
          <ErrorBoundary fallback={<span>ORDER ERROR</span>}>
            <Reverse />
            <OrderContent manage={manage} />
            {orderType === Operation.NONE ? (
              <>
                <IconButton
                  text="Manage Options"
                  variant="transparent"
                  onClick={() => {
                    updateItem(item, Operation.NONE)
                    setManage(!manage)
                  }}
                >
                  {manage ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                {manage ? <ManageOptions /> : null}
              </>
            ) : null}
          </ErrorBoundary>
        </CardContent>
      </Card>
    </>
  )
}

const CustomButton = styled.div`
  margin-top: -0.1em;
  background: none;
`
const Reverse = styled.div`
  margin-top: -0.9em;
`

const StyledTitle = styled.h3`
  align-items: center;
  border-bottom: 0px solid ${(props) => props.theme.color.grey[600]};
  width: 100%;
  color: white;
`

const LoadingOverlay = styled.div`
  z-index: 400;
`

const StyledARef = styled.a`
  color: ${(props) => props.theme.color.grey[400]};
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.color.white};
  }
`

export default OrderCard
