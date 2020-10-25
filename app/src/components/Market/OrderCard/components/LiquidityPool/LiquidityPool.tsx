import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import Toggle from '@/components/Toggle'
import ToggleButton from '@/components/ToggleButton'

import useOrders from '@/hooks/useOrders'

import { destructureOptionSymbol } from '@/lib/utils'

import LP from './components/LP'
import WLP from './components/WLP'

const LiquidityPool: React.FC = () => {
  const { item, orderType } = useOrders()
  const { asset, month, day, type, strike } = destructureOptionSymbol(item.id)

  const isLP = useMemo(() => {
    if (orderType === 'W_LP') {
      return false
    }
    return true
  }, [orderType])

  const title = useMemo(() => {
    if (isLP) {
      return `Provide Liquidity ${asset} ${
        type === 'C' ? 'Call' : 'Put'
      } $${strike} ${month}/${day}`
    }
    return `Withdrawl Liquidity ${asset} ${
      type === 'C' ? 'Call' : 'Put'
    } $${strike} ${month}/${day}`
  }, [asset, day, month, strike, type])

  return (
    <Card border>
      <CardContent>
        <StyledTitle>{title}</StyledTitle>
        {isLP ? <LP /> : <WLP />}
      </CardContent>
    </Card>
  )
}

const StyledTitle = styled.h4`
  align-items: center;
  color: ${(props) => props.theme.color.white};
  display: flex;
  font-size: 18px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px;
`

export default LiquidityPool
