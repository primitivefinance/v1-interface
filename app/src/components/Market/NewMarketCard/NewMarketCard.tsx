import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

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
import Slider from '@/components/Slider'
import { destructureOptionSymbol } from '@/lib/utils'
import { Operation } from '@/constants/index'
import useTokenBalance from '@/hooks/useTokenBalance'

import { useItem, useRemoveItem } from '@/state/order/hooks'

const NewMarketCard: React.FC = () => {
  const { item, orderType } = useItem()
  const removeItem = useRemoveItem()
  const [quantity, setQuantity] = useState('')
  const [strike, setStrike] = useState('')
  const [long, setLong] = useState(true)
  const [ratio, setRatio] = useState(100)
  const { library } = useWeb3React()
  const tokenBalance = useTokenBalance(item.entity?.assetAddresses[0])
  const clear = () => {
    removeItem()
  }

  const handleToggleClick = useCallback(() => {
    setLong(!long)
  }, [long, setLong])

  const handleSubmitClick = useCallback(() => {
    removeItem()
  }, [removeItem, item, library, quantity])

  const handleStrikeChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (!e.currentTarget.value) {
        setStrike('')
      } else {
        setStrike(e.currentTarget.value)
      }
    },
    [setStrike]
  )
  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (!e.currentTarget.value) {
        setQuantity('')
      } else {
        setQuantity(e.currentTarget.value)
      }
    },
    [setQuantity]
  )
  const handleRatioChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setRatio(Number(e.currentTarget.value))
    },
    [setRatio]
  )
  const handleSetMax = () => {
    const max = Math.round(1 * ratio) / 100
    setQuantity(max.toString())
  }
  // parseInt->toString removes syntax error
  const exp = new Date(parseInt(item.expiry.toString()) * 1000)
  if (orderType !== Operation.NEW_MARKET) {
    return null
  }
  return (
    <Card>
      <CardTitle>
        <StyledTitle>
          {`Create an ${item.asset.toUpperCase()} ${item.expiry} Option`}
          <></>
          <StyledFlex />
          <Button variant="transparent" size="sm" onClick={() => clear()}>
            <ClearIcon />
          </Button>
        </StyledTitle>
      </CardTitle>
      <CardContent>
        <Label text={'Strike (DAI)'} />
        <Spacer size="sm" />
        <Input
          startAdornment={<StyledP>$</StyledP>}
          value={strike}
          placeholder="0.00"
          onChange={handleStrikeChange}
        />
        <Spacer />
        <PriceInput
          title={`Total ${item.asset} Deposit`}
          startAdornment={<StyledP></StyledP>}
          quantity={quantity}
          onChange={handleChange}
          onClick={handleSetMax}
        />
        <Spacer />
        <Box row alignItems="center">
          <Label text={`Opening LP token / ${item.asset}  Ratio `} />
          <Spacer size="md" />
          <StyledRatio>{Math.round(10 * (ratio / 10)) / 10 + '%'}</StyledRatio>
        </Box>
        <Slider
          min={1}
          max={1000}
          step={0.1}
          value={ratio}
          onChange={handleRatioChange}
        />
        <Spacer />
        <Box row alignItems="center" justifyContent="space-between">
          <Label text={`Opening Premium in ${item.asset}`} />
          <StyledRatio>{(ratio * +quantity) / 1000}</StyledRatio>
          <Spacer size="sm" />
        </Box>
        <Button
          disabled={!quantity}
          full
          size="sm"
          onClick={handleSubmitClick}
          text="Confirm Transaction"
        />
      </CardContent>
    </Card>
  )
}

const StyledP = styled.p`
  color: ${(props) => props.theme.color.white};
`
const StyledRatio = styled.h4`
  color: ${(props) => props.theme.color.white};
`
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
