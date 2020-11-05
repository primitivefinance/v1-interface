import React, { useCallback, useState } from 'react'

import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import Input from '@/components/Input'
import Label from '@/components/Label'
import Spacer from '@/components/Spacer'

import useOrders from '@/hooks/useOrders'
import useTokenBalance from '@/hooks/useTokenBalance'

import formatBalance from '@/utils/formatBalance'
import { destructureOptionSymbol } from '@/lib/utils'
import { Operation } from '@/lib/constants'

const Test: React.FC = () => {
  const { item, onChangeItem, onRemoveItem } = useOrders()
  const [quantity, setQuantity] = useState('')
  const { library } = useWeb3React()

  const testEthAddress = '0xc45c339313533a6c9B05184CD8B5486BC53F75Fb' // Fix - should not be hardcode
  const tokenBalance = useTokenBalance(testEthAddress)
  /*
  const handleMintClick = useCallback(() => {
    mintTestTokens(library, item?.address, Number(quantity))
    onRemoveItem(item)
  }, [mintTestTokens, onRemoveItem, item, library, quantity])
  */
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
    const max =
      Math.round((+tokenBalance / +item.premium + Number.EPSILON) * 100) / 100
    setQuantity(max.toString())
  }
  return (
    <>
      <Box row justifyContent="flex-start">
        <IconButton
          variant="tertiary"
          size="sm"
          onClick={() => onChangeItem(item, '')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Spacer />
        <StyledTitle>{`Mint Test Tokens`}</StyledTitle>
      </Box>
      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="Price" />
        <span>${item.premium.toString().substr(0, 4)}</span>
      </Box>
      <Spacer />
      <Box row justifyContent="flex-start"></Box>
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
        <Label text="Minting Power" />
        <span>{formatBalance(tokenBalance)} ETH</span>
      </Box>
      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="Total Credit" />
        <span>
          {+quantity ? '+' : ''}${(+item.premium * +quantity).toFixed(2)}
        </span>
      </Box>
      <Spacer />
      <Button disabled={!quantity} full text="Continue to Review" />
    </>
  )
}

const StyledTitle = styled.h5`
  align-items: center;
  color: ${(props) => props.theme.color.white};
  display: flex;
  font-size: 18px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px;
`
export default Test
