import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import Toggle from '@/components/Toggle'
import ToggleButton from '@/components/ToggleButton'

import useOrders from '@/hooks/useOrders'

import { destructureOptionSymbol } from '@/lib/utils'

import Exercise from './components/Exercise'
import Sell from './components/Sell'

const SellOrExercise: React.FC = () => {
  const { item } = useOrders()
  const [sellCard, setSellCard] = useState(true)

  const handleToggle = useCallback(() => {
    setSellCard(!sellCard)
  }, [sellCard, setSellCard])

  const { asset, month, day, type, strike } = destructureOptionSymbol(
    item.id
  )

  const title = useMemo(() => {
    if (sellCard) {
      return `Sell to Close ${asset} ${
        type === 'C' ? 'Call' : 'Put'
      } $${strike} ${month}/${day}`
    }
    return `Exercise ${asset} ${
      type === 'C' ? 'Call' : 'Put'
    } $${strike} ${month}/${day}`
  }, [asset, sellCard, day, month, strike, type])
  return (
    <Card border>
      <CardContent>
      <StyledTitle>{title}</StyledTitle>
        <Toggle>
          <ToggleButton active={sellCard} onClick={handleToggle} text="Sell" />
          <ToggleButton
            active={!sellCard}
            onClick={handleToggle}
            text="Exercise"
          />
        </Toggle>
        {sellCard ? <Sell /> : <Exercise />}
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

export default SellOrExercise
