import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import LineItem from '@/components/LineItem'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'

import useOrders from '@/hooks/useOrders'
import useTokenBalance from '@/hooks/useTokenBalance'

import { Operation } from '@/lib/constants'
import formatBalance from '@/utils/formatBalance'

import Exercise from '../Exercise/Exercise'
import LP from '../LiquidityPool/LP'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { useWeb3React } from '@web3-react/core'

export interface SubmitProps {
  orderType: Operation
}

const Submit: React.FC<SubmitProps> = ({ orderType }) => {
  const { submitOrder, item, onChangeItem, onRemoveItem } = useOrders()
  const [quantity, setQuantity] = useState('')
  const { library } = useWeb3React()

  const stablecoinAddress = '0xb05cB19b19e09c4c7b72EA929C8CfA3187900Ad2' // Fix - should not be hardcode
  const testEthAddress = '0xc45c339313533a6c9B05184CD8B5486BC53F75Fb'

  let tokenAddress: string
  let title: string
  let capitalLabel: string
  let isDebit: boolean
  let sign: string
  switch (orderType) {
    case Operation.LONG:
      title = 'Buy Long'
      capitalLabel = 'Buying'
      isDebit = true
      sign = '-'
      tokenAddress = stablecoinAddress
      break
    case Operation.SHORT:
      title = 'Sell Short'
      capitalLabel = 'Minting'
      isDebit = false
      sign = '+'
      tokenAddress = testEthAddress
      break
    case Operation.MINT:
      capitalLabel = 'Minting'
      tokenAddress = testEthAddress
      break
    case Operation.EXERCISE:
      capitalLabel = 'Exercising'
      tokenAddress = stablecoinAddress
      sign = '-'
      break
    case Operation.REDEEM:
      capitalLabel = 'Redeem'
      break
    case Operation.CLOSE:
      capitalLabel = 'Close'
      break
    case Operation.UNWIND:
      capitalLabel = 'Close'
      break
    case Operation.ADD_LIQUIDITY:
      title = 'Provide Liquidity'
      capitalLabel = 'LP Token'
      tokenAddress = stablecoinAddress
      break
    case Operation.REMOVE_LIQUIDITY:
      title = 'Remove Liquidity'
      tokenAddress = stablecoinAddress
      break
    case Operation.CLOSE_LONG:
      title = 'Close Long'
      capitalLabel = ''
      tokenAddress = stablecoinAddress
      break
    case Operation.CLOSE_SHORT:
      title = 'Close Short'
      capitalLabel = ''
      tokenAddress = stablecoinAddress
      break
    default:
      capitalLabel = 'Buying'
      tokenAddress = stablecoinAddress
      break
  }

  const tokenBalance = useTokenBalance(tokenAddress)

  const handleSubmitClick = useCallback(() => {
    submitOrder(library, item?.address, Number(quantity), orderType)
    onRemoveItem(item)
  }, [submitOrder, onRemoveItem, item, library, quantity])

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
      Math.round((+tokenBalance / +item.price + Number.EPSILON) * 100) / 100
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
        <StyledTitle>{`${title ? title : capitalLabel}`}</StyledTitle>
      </Box>

      {orderType === Operation.ADD_LIQUIDITY ? (
        <LP
          title={`Quantity (${item.id})`}
          balance={formatBalance(tokenBalance)}
          quantity={quantity}
          onChange={handleQuantityChange}
          onClick={handleSetMax}
        />
      ) : (
        <>
          <Spacer />
          <LineItem label="Price" data={item.price} units="$" />
          <Spacer />
          <PriceInput
            title="Quantity"
            onChange={handleQuantityChange}
            quantity={quantity}
            onClick={handleSetMax}
          />
        </>
      )}
      <Spacer />

      {capitalLabel.length > 0 ? (
        <LineItem
          label={`${capitalLabel} Power`}
          data={tokenBalance}
          units="$"
        />
      ) : (
        <> </>
      )}

      <Spacer />
      {orderType === Operation.EXERCISE ? (
        <Exercise
          cost={`${sign} ${formatBalance(+item.strike * +quantity)}`}
          received={`${formatBalance(+quantity)} ${item.id
            .slice(0, 3)
            .toUpperCase()}`}
        />
      ) : (
        <>
          <LineItem
            label={`Total ${isDebit ? 'Debit' : 'Credit'}`}
            data={+item?.price * +quantity}
            units={`${sign ? sign : ''} $`}
          />
          <Spacer />
        </>
      )}
      <Button
        disabled={!quantity}
        full
        size="sm"
        onClick={handleSubmitClick}
        text="Review Transaction"
      />
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
export default Submit
