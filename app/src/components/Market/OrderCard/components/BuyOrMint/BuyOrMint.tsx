import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import Toggle from '@/components/Toggle'
import ToggleButton from '@/components/ToggleButton'

import useOrders from '@/hooks/useOrders'

import { destructureOptionSymbol } from '@/lib/utils'

import Buy from './components/Buy'
import Mint from './components/Mint'

const BuyOrMint: React.FC = () => {
  const { item } = useOrders()
  const [buyCard, setBuyCard] = useState(true)

  const handleToggle = useCallback(() => {
    setBuyCard(!buyCard)
  }, [buyCard, setBuyCard])

  const { asset, month, day, type, strike } = destructureOptionSymbol(item.id)

  const title = useMemo(() => {
    if (buyCard) {
      return `Open Long ${asset} ${
        type === 'C' ? 'Call' : 'Put'
      } $${strike} ${month}/${day}`
    }
    return `Open Short ${asset} ${
      type === 'C' ? 'Call' : 'Put'
    } $${strike} ${month}/${day}`
  }, [asset, buyCard, day, month, strike, type])

  return (
    <Card border>
      <CardContent>
        <StyledTitle>{title}</StyledTitle>
        <Toggle>
          <ToggleButton
            size="sm"
            active={buyCard}
            onClick={handleToggle}
            text="Buy"
          />
          <ToggleButton
            size="sm"
            active={!buyCard}
            onClick={handleToggle}
            text="Mint"
          />
        </Toggle>
        {buyCard ? <Buy /> : <Mint />}
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

export default BuyOrMint
