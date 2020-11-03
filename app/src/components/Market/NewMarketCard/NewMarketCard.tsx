import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import useOrders from '@/hooks/useOrders'
import ClearIcon from '@material-ui/icons/Clear'
import { useWeb3React } from '@web3-react/core'

import Button from '@/components/Button'
import Box from '@/components/Box'
import Toggle from '@/components/Toggle'
import ToggleButton from '@/components/ToggleButton'
import Input from '@/components/Input'
import Label from '@/components/Label'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import { destructureOptionSymbol } from '@/lib/utils'
import { OrderItem, NewOptionItem } from '@/contexts/Order/types'
import { Operation } from '@/lib/constants'
import useTokenBalance from '@/hooks/useTokenBalance'

const NewMarketCard: React.FC = () => {
  const { item, onRemoveItem } = useOrders()
  const [quantity, setQuantity] = useState('')
  const [long, setLong] = useState(true)
  const [premium, setPrice] = useState(0)
  const { library } = useWeb3React()
  const tokenBalance = useTokenBalance(item.address)

  const clear = () => {
    onRemoveItem(item)
  }

  const handleToggleClick = useCallback(() => {
    setLong(!long)
  }, [long, setLong])

  const handleSubmitClick = useCallback(() => {
    onRemoveItem(item)
  }, [onRemoveItem, item, library, quantity])

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (!e.currentTarget.value) {
        setQuantity('')
      }
      if (Number(e.currentTarget.value)) {
        setQuantity(e.currentTarget.value)
      }
    },
    [setQuantity]
  )
  const handleChangePrice = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (!e.currentTarget.value) {
        setPrice('0.00')
      }
      if (Number(e.currentTarget.value)) {
        setPrice(Number(e.currentTarget.value))
      }
    },
    [setPrice]
  )
  const handleSetMax = () => {
    const max =
      Math.round((+tokenBalance / +premium + Number.EPSILON) * 100) / 100
    setQuantity(max.toString())
  }
  const exp = new Date(+item.expiry * 1000)
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
          {`Create an ${item.asset.toUpperCase()} Option`}
          <></>
          <StyledFlex />
          <Button variant="transparent" size="sm" onClick={() => clear()}>
            <ClearIcon />
          </Button>
        </StyledTitle>
      </CardTitle>
      <CardContent>
        <Toggle>
          <ToggleButton
            active={long}
            onClick={handleToggleClick}
            text="Open Long"
          />
          <ToggleButton
            active={!long}
            onClick={handleToggleClick}
            text="Open Short"
          />
        </Toggle>
        <Spacer />
        <Label text={`Opening Price (LP token / ${item.asset})`} />
        <Spacer size="sm" />
        <Input
          quantity={premium}
          placeholder="0.00"
          onChange={handleChangePrice}
        />
        <Spacer />
        <PriceInput
          title={`Total ${item.asset} Deposit`}
          quantity={quantity}
          onChange={handleChange}
          onClick={handleSetMax}
        />
        <Spacer />
        <Box row justifyContent="space-between">
          <Label text="Price per LP Token" />
        </Box>
        <Spacer />
        <Button
          disabled={!quantity}
          full
          size="sm"
          onClick={handleSubmitClick}
          text="Review Transaction"
        />
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

export default NewMarketCard
