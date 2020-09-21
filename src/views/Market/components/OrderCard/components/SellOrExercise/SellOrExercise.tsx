import React, { useCallback, useMemo, useState } from 'react'

import Card from 'components/Card'
import CardContent from 'components/CardContent'
import CardTitle from 'components/CardTitle'
import Toggle from 'components/Toggle'
import ToggleButton from 'components/ToggleButton'

import useOrders from 'hooks/useOrders'

import { destructureOptionSymbol } from 'lib/utils'

import Exercise from './components/Exercise'
import Sell from './components/Sell'

const SellOrExercise: React.FC = () => {
    const { item } = useOrders()
    const [sellCard, setSellCard] = useState(true)
  
    const handleToggle = useCallback(() => {
      setSellCard(!sellCard)
    }, [
      sellCard,
      setSellCard,
    ])
  
    const { asset, year, month, day, type, strike } = destructureOptionSymbol(item.id)
  
    const title = useMemo(() => {
      if (sellCard) {
        return `Sell ${asset} ${type === "C" ? "Call" : "Put"} $${strike} ${month}/${day}/${year}`
      }
      return `Exercise ${asset} ${type === "C" ? "Call" : "Put"} $${strike} ${month}/${day}/${year}`
    }, [
      asset,
      sellCard,
      day,
      month,
      strike,
      type,
      year,
    ])
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardContent>
        <Toggle>
          <ToggleButton
            active={sellCard}
            onClick={handleToggle}
            text="Sell"
          />
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

export default SellOrExercise