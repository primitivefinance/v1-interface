import React, { useCallback, useState } from 'react'

import { useWeb3React } from '@web3-react/core'

import Box from 'components/Box'
import Button from 'components/Button'
import Input from 'components/Input'
import Label from 'components/Label'
import Spacer from 'components/Spacer'

import useOrders from 'hooks/useOrders'
import useTokenBalance from 'hooks/useTokenBalance'

import formatBalance from '../../../../../../../utils/formatBalance'

const Sell: React.FC = () => {
  const { sellOptions, item } = useOrders()
  const [quantity, setQuantity] = useState('')
  const { library } = useWeb3React()

  const testEthAddress = '0xc45c339313533a6c9B05184CD8B5486BC53F75Fb' // Fix - should not be hardcode
  const stablecoinAddress = '0xb05cB19b19e09c4c7b72EA929C8CfA3187900Ad2' // Fix - should not be hardcode
  // Conditionally show the selling power according to the collateral for each type, put or call.
  const tokenAddress =
    item.id.substring(11, 12) === 'C' ? testEthAddress : stablecoinAddress
  const tokenBalance = useTokenBalance(tokenAddress)

  const handleSellClick = useCallback(() => {
    sellOptions(library, item?.address, Number(quantity))
  }, [sellOptions, item, library, quantity])

  const handleQuantityChange = useCallback(
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

  const handleSetMax = () => {
    let max =
      Math.round((+tokenBalance / +item.price + Number.EPSILON) * 100) / 100
    setQuantity(max.toString())
  }

  return (
    <>
      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="Price" />
        <span>${item.price.toFixed(2)}</span>
      </Box>
      <Spacer />
      <Label text="Quantity" />
      <Spacer size="sm" />
      <Input
        placeholder="0.00"
        onChange={handleQuantityChange}
        value={`${quantity}`}
        endAdornment={<Button size="sm" text="Max" onClick={handleSetMax} />}
      />
      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="Selling Power" />
        <span>{formatBalance(tokenBalance)} ETH</span>
      </Box>
      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="Total Credit" />
        <span>
          {+quantity > 0 ? '+' : ''} ${(+item.price * +quantity).toFixed(2)}
        </span>
      </Box>
      <Spacer />
      <Button
        disabled={!quantity}
        full
        onClick={handleSellClick}
        text="Continue to Review"
      />
    </>
  )
}

export default Sell
