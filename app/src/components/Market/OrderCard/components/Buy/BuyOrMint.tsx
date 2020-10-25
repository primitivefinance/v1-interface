import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import Box from '@/components/Box'
import Button from '@/components/Button'
import Spacer from '@/components/Spacer'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import Toggle from '@/components/Toggle'
import ToggleButton from '@/components/ToggleButton'

import useOrders from '@/hooks/useOrders'

import { destructureOptionSymbol } from '@/lib/utils'

import Buy from './Buy'
import Mint from './components/Mint'

const BuyOrMint: React.FC = () => {
  const { item, onChangeItem } = useOrders()
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
        <Box row justifyContent="space-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onChangeItem(item, '')}
            text="Back"
          />
          <Spacer />
          <StyledTitle>{title}</StyledTitle>
        </Box>
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
