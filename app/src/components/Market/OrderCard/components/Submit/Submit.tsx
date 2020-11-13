import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { AddLiquidity } from '../AddLiquidity'
import { Swap } from '../Swap'
import Exercise from '../Exercise/Exercise'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import LineItem from '@/components/LineItem'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'
import { STABLECOINS } from '@/constants/index'
import { Operation } from '@/constants/index'

import { formatEther } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'

import useTokenBalance from '@/hooks/useTokenBalance'
import { useReserves } from '@/hooks/data/useReserves'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import {
  useItem,
  useUpdateItem,
  useHandleSubmitOrder,
  useRemoveItem,
} from '@/state/order/hooks'

import { Token } from '@uniswap/sdk'
import formatBalance from '@/utils/formatBalance'
import formatEtherBalance from '@/utils/formatEtherBalance'
import { useWeb3React } from '@web3-react/core'

export interface SubmitProps {
  orderType: Operation
}

const Submit: React.FC<SubmitProps> = () => {
  const submitOrder = useHandleSubmitOrder()
  const { item, orderType } = useItem()
  const updateItem = useUpdateItem()
  const removeItem = useRemoveItem()

  const [submitting, setSubmit] = useState(false)
  const [inputs, setInputs] = useState({
    primary: '',
    secondary: '',
  })
  const { library, chainId } = useWeb3React()
  const entity = item.entity
  const lpPair = useReserves(
    new Token(
      entity.chainId,
      entity.assetAddresses[0],
      18,
      item.asset.toUpperCase()
    ),
    new Token(entity.chainId, entity.assetAddresses[2], 18, 'SHORT')
  ).data

  const handleInputChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setInputs({ ...inputs, [e.currentTarget.name]: e.currentTarget.value })
    },
    [setInputs, inputs]
  )

  const stablecoinAddress = STABLECOINS[chainId].address
  const testEthAddress = '0xc45c339313533a6c9B05184CD8B5486BC53F75Fb'

  let tokenAddress: string
  let title: string
  let capitalLabel: string
  let isDebit: boolean
  let sign: string
  switch (orderType) {
    case Operation.LONG:
      title = 'Buy Long Tokens'
      capitalLabel = 'Buying'
      isDebit = true
      sign = '-'
      tokenAddress = stablecoinAddress
      break
    case Operation.SHORT:
      title = 'Sell Short Tokens'
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
      tokenAddress = lpPair ? lpPair.liquidityToken.address : ''
      break
    case Operation.REMOVE_LIQUIDITY:
      title = 'Remove Liquidity'
      capitalLabel = 'LP Token'
      tokenAddress = stablecoinAddress
      break
    case Operation.CLOSE_LONG:
      title = 'Close Long Position'
      capitalLabel = ''
      tokenAddress = stablecoinAddress
      sign = '+'
      break
    case Operation.CLOSE_SHORT:
      title = 'Close Short Position'
      capitalLabel = ''
      tokenAddress = stablecoinAddress
      sign = '-'
      break
    default:
      break
  }

  const tokenBalance = useTokenBalance(tokenAddress)

  const calculateTotalDebit = () => {
    let debit = '0'
    if (item.premium) {
      const premium = BigNumber.from(item.premium.toString())
      const size = inputs.primary === '' ? '0' : inputs.primary
      debit = formatEther(premium.mul(size).toString())
    }
    return debit
  }

  const handleSubmitClick = useCallback(() => {
    setSubmit(true)
    submitOrder(
      library,
      item?.address,
      Number(inputs.primary),
      orderType,
      Number(inputs.secondary)
    )
    removeItem()
  }, [submitOrder, removeItem, item, library, inputs, orderType])

  const handleSetMax = () => {
    const max =
      Math.round((+tokenBalance / +item.premium + Number.EPSILON) * 100) / 100
    setInputs({ ...inputs, primary: max.toString() })
  }

  return (
    <>
      {orderType === Operation.ADD_LIQUIDITY ? (
        <AddLiquidity />
      ) : (
        <>
          <Swap />
          {/* <Box row justifyContent="flex-start">
            <IconButton
              variant="tertiary"
              size="sm"
              onClick={() => updateItem(item, Operation.NONE)}
            >
              <ArrowBackIcon />
            </IconButton>
            <Spacer size="sm" />
            <StyledTitle>{`${title ? title : capitalLabel}`}</StyledTitle>
          </Box>
          <>
            <Spacer />
            <LineItem
              label="Option Premium"
              data={formatEtherBalance(item.premium).toString()}
              units={item.asset}
            />
            <Spacer />
            <PriceInput
              title="Quantity"
              name="primary"
              onChange={handleInputChange}
              quantity={inputs.primary}
              onClick={handleSetMax}
            />
          </>
          <Spacer />
          {orderType === Operation.EXERCISE ? (
            <Exercise
              cost={`${sign} ${formatBalance(+item.strike * +inputs.primary)}`}
              received={`${formatBalance(+inputs.primary)} ${item.id
                .slice(0, 3)
                .toUpperCase()}`}
            />
          ) : (
            <>
              <LineItem
                label={`Total ${isDebit ? 'Debit' : 'Credit'}`}
                data={calculateTotalDebit().toString()}
                units={`${sign ? sign : ''} ${item.asset.toUpperCase()}`}
              />
              <Spacer />
            </>
          )} 
          <Button
            disabled={!inputs || submitting}
            full
            size="sm"
            onClick={handleSubmitClick}
            isLoading={submitting}
            text="Review Transaction"
          />{' '}*/}
        </>
      )}
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
