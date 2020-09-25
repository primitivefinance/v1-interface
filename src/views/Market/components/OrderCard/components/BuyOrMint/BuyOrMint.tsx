import React, { useCallback, useMemo, useState } from 'react'

import Card from 'components/Card'
import CardContent from 'components/CardContent'
import CardTitle from 'components/CardTitle'
import Toggle from 'components/Toggle'
import ToggleButton from 'components/ToggleButton'

import useOrders from 'hooks/useOrders'

import { destructureOptionSymbol } from 'lib/utils'

import Buy from './components/Buy'
import Mint from './components/Mint'

const BuyOrMint: React.FC = () => {
  const { item } = useOrders()
  const [buyCard, setBuyCard] = useState(true)

  const handleToggle = useCallback(() => {
    setBuyCard(!buyCard)
  }, [buyCard, setBuyCard])

  const { asset, year, month, day, type, strike } = destructureOptionSymbol(
    item.id
  )

  const title = useMemo(() => {
    if (buyCard) {
      return `Buying ${asset} ${
        type === 'C' ? 'Call' : 'Put'
      } $${strike} ${month}/${day}/${year}`
    }
    return `Minting ${asset} ${
      type === 'C' ? 'Call' : 'Put'
    } $${strike} ${month}/${day}/${year}`
  }, [asset, buyCard, day, month, strike, type, year])

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardContent>
        <Toggle>
          <ToggleButton active={buyCard} onClick={handleToggle} text="Buy" />
          <ToggleButton active={!buyCard} onClick={handleToggle} text="Mint" />
        </Toggle>
        {buyCard ? <Buy /> : <Mint />}
      </CardContent>
    </Card>
  )
}

export default BuyOrMint
