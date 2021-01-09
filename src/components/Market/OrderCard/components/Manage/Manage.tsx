import React, { useState, useCallback } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import LineItem from '@/components/LineItem'
import Loader from '@/components/Loader'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'
import Tooltip from '@/components/Tooltip'
import WarningLabel from '@/components/WarningLabel'
import { Operation, TRADER } from '@/constants/index'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'

import useApprove from '@/hooks/transactions/useApprove'
import useTokenBalance from '@/hooks/useTokenBalance'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { useAllTransactions } from '@/state/transactions/hooks'

import {
  useItem,
  useUpdateItem,
  useHandleSubmitOrder,
  useRemoveItem,
} from '@/state/order/hooks'
import { useAddNotif } from '@/state/notifs/hooks'
import { useSwapActionHandlers, useSwap } from '@/state/swap/hooks'
import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount } from '@uniswap/sdk'
import { tryParseAmount } from '@/utils/index'

const Manage: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  const removeItem = useRemoveItem()
  // approval state
  const { item, orderType, approved, loading } = useItem()
  const txs = useAllTransactions()

  // inputs for user quantity
  // inputs for quant
  const { typedValue, inputLoading } = useSwap()
  const { onUserInput } = useSwapActionHandlers()
  const parsedAmount = tryParseAmount(typedValue)
  // web3
  const { library, chainId } = useWeb3React()
  const addNotif = useAddNotif()

  // pair and option entities
  const entity = item.entity
  const underlyingToken: Token = entity.underlying

  let title = { text: '', tip: '' }
  let tokenAddress: string
  let secondaryAddress: string
  let balance: Token
  switch (orderType) {
    case Operation.MINT:
      title = {
        text: 'Mint Options',
        tip: 'Deposit underlying tokens to mint long and short option tokens.',
      }
      tokenAddress = underlyingToken.address
      secondaryAddress = entity.strike.address
      balance = underlyingToken
      break
    case Operation.EXERCISE:
      title = {
        text: 'Exercise Options',
        tip:
          'Pay strike price and burn option tokens to release underlying tokens.',
      }
      tokenAddress = entity.address
      secondaryAddress = entity.strike.address
      balance = new Token(entity.chainId, tokenAddress, 18, 'LONG')
      break
    case Operation.REDEEM:
      title = {
        text: 'Redeem Strike Tokens',
        tip: `Burn short option tokens to release strike tokens, if options were exercised.`,
      }
      tokenAddress = entity.redeem.address
      secondaryAddress = entity.strike.address
      balance = new Token(entity.chainId, tokenAddress, 18, 'REDEEM')
      break
    case Operation.CLOSE:
      title = {
        text: 'Close Options',
        tip: `Burn long and short option tokens to receive underlying tokens.`,
      }
      tokenAddress = entity.address
      secondaryAddress = entity.redeem.address
      balance = new Token(entity.chainId, tokenAddress, 18, 'LONG')
      break
    default:
      break
  }
  const tokenBalance = useTokenBalance(tokenAddress)
  const tokenAmount: TokenAmount = new TokenAmount(
    balance,
    parseEther(tokenBalance).toString()
  )
  const spender = TRADER[chainId]
  const underlyingTokenBalance = useTokenBalance(underlyingToken.address)
  const handleApprove = useApprove()

  const strikeBalance = useTokenBalance(entity.redeem.address)

  const handleInputChange = useCallback(
    (value: string) => {
      onUserInput(value)
    },
    [onUserInput]
  )

  // FIX
  const handleSetMax = useCallback(() => {
    tokenBalance && onUserInput(tokenBalance)
  }, [tokenBalance, onUserInput])

  const handleSubmitClick = useCallback(() => {
    submitOrder(
      library,
      BigInt(parsedAmount.toString()),
      orderType,
      BigInt('0')
    )
    removeItem()
  }, [submitOrder, removeItem, item, library, parsedAmount, orderType])

  const premiumMulSize = (premium, size) => {
    const premiumWei = BigNumber.from(BigInt(parseFloat(premium)).toString())

    if (size?.toString() === '0' || !size || premiumWei.toString() === '')
      return '0'

    const debit = formatEther(
      premiumWei.mul(size).div(BigNumber.from('1000000000000000000')).toString()
    )
    return debit
  }

  const calculateCosts = useCallback(() => {
    let long = '0'
    let short = '0'
    let underlying = '0'
    let strike = '0'
    const size = parsedAmount
    const base = item.entity.baseValue.raw.toString()
    const quote = item.entity.quoteValue.raw.toString()
    switch (orderType) {
      case Operation.MINT:
        long = formatEther(size)
        short = formatEther(entity.proportionalShort(size))
        underlying = long
        break
      case Operation.EXERCISE:
        long = formatEther(size)
        underlying = long
        strike = formatEther(entity.proportionalShort(size)).toString()
        break
      case Operation.REDEEM:
        short = formatEther(size)
        strike = short
        break
      case Operation.CLOSE:
        long = formatEther(size)
        underlying = long
        short = formatEther(entity.proportionalShort(size))
        break
      default:
        break
    }
    return { long, short, underlying, strike }
  }, [item, orderType, parsedAmount])

  const hasEnoughStrikeTokens = useCallback(() => {
    const inputValue = parsedAmount
    if (orderType === Operation.REDEEM) {
      return parseEther(parseFloat(strikeBalance).toString()).gt(
        BigNumber.from(inputValue)
      )
    } else {
      return true
    }
  }, [parsedAmount, strikeBalance])

  const handleApproval = useCallback(async () => {
    handleApprove(tokenAddress, spender)
      .then()
      .catch((error) => {
        addNotif(0, `Approving ${item.asset.toUpperCase()}`, error.message, '')
      })
  }, [handleApprove, tokenAddress, spender])

  const handleSecondApp = useCallback(async () => {
    handleApprove(secondaryAddress, spender)
      .then()
      .catch((error) => {
        addNotif(0, `Approving ${item.asset.toUpperCase()}`, error.message, '')
      })
  }, [handleApprove, secondaryAddress, spender])

  return (
    <>
      <Box row justifyContent="flex-start">
        <IconButton
          variant="tertiary"
          size="sm"
          onClick={() => updateItem(item, Operation.NONE)}
        >
          <ArrowBackIcon />
        </IconButton>
        <Spacer size="sm" />
        <StyledTitle>
          <Tooltip text={title.tip}>{title.text}</Tooltip>
        </StyledTitle>
      </Box>

      <Spacer />
      <PriceInput
        title="Quantity"
        name="primary"
        onChange={handleInputChange}
        quantity={typedValue}
        onClick={handleSetMax}
        balance={tokenAmount}
        valid={parseEther(underlyingTokenBalance).gt(
          parseEther(calculateCosts().long)
        )}
      />
      <Spacer size="sm" />
      {orderType === Operation.EXERCISE ? (
        <>
          <LineItem
            label={'Burn'}
            data={calculateCosts().long}
            units={`- LONG`}
          />
          <LineItem
            label={'Pay'}
            data={calculateCosts().strike}
            units={`- ${entity.isPut ? item.asset.toUpperCase() : 'DAI'}`}
          />
          <LineItem
            label={'Receive'}
            data={calculateCosts().underlying}
            units={`+ ${entity.isPut ? 'DAI' : item.asset.toUpperCase()}`}
          />
        </>
      ) : orderType === Operation.MINT ? (
        <>
          <LineItem
            label={'Deposit'}
            data={calculateCosts().underlying}
            units={`- ${entity.isPut ? 'DAI' : item.asset.toUpperCase()}`}
          />
          <LineItem
            label={'Receive'}
            data={calculateCosts().long}
            units={`+ LONG`}
          />
          <LineItem
            label={'Receive'}
            data={calculateCosts().short}
            units={`+ SHORT`}
          />
        </>
      ) : orderType === Operation.REDEEM ? (
        <>
          <LineItem
            label={`Available`}
            data={strikeBalance}
            units={`${entity.isPut ? 'DAI' : item.asset.toUpperCase()}`}
          />
          <LineItem
            label={`Burn`}
            data={calculateCosts().short}
            units={`- SHORT`}
          />
          <LineItem
            label={`Receive`}
            data={calculateCosts().strike}
            units={`+ ${entity.isPut ? 'DAI' : item.asset.toUpperCase()}`}
          />
        </>
      ) : orderType === Operation.CLOSE ? (
        <>
          {item.entity.getTimeToExpiry() === 0 ? (
            <LineItem
              label={'Burn'}
              data={calculateCosts().long}
              units={`- LONG`}
            />
          ) : (
            <> </>
          )}
          <LineItem
            label={'Burn'}
            data={calculateCosts().short}
            units={`- SHORT`}
          />
          <LineItem
            label={'Receive'}
            data={calculateCosts().underlying}
            units={`+ ${entity.isPut ? 'DAI' : item.asset.toUpperCase()}`}
          />
        </>
      ) : (
        <></>
      )}
      <Spacer size="sm" />

      <Box row justifyContent="flex-start">
        {loading ? (
          <div style={{ width: '100%' }}>
            <Box column alignItems="center" justifyContent="center">
              <Loader />
            </Box>
          </div>
        ) : (
          <>
            {orderType === Operation.EXERCISE ||
            orderType === Operation.CLOSE ? (
              <>
                {approved[0] ? (
                  <> </>
                ) : (
                  <>
                    <Button
                      disabled={loading}
                      full
                      size="sm"
                      onClick={handleApproval}
                      isLoading={loading}
                      text="Approve Options"
                    />
                  </>
                )}
                {approved[1] ? (
                  <> </>
                ) : (
                  <>
                    <Button
                      disabled={loading}
                      full
                      size="sm"
                      onClick={handleSecondApp}
                      isLoading={loading}
                      text="Approve Tokens"
                    />
                  </>
                )}
              </>
            ) : (
              <>
                {approved[0] ? (
                  <> </>
                ) : (
                  <>
                    <Button
                      disabled={loading}
                      full
                      size="sm"
                      onClick={handleApproval}
                      isLoading={loading}
                      text="Approve"
                    />
                  </>
                )}
                <Button
                  disabled={
                    !approved[0] ||
                    !parsedAmount.gt(0) ||
                    loading ||
                    !hasEnoughStrikeTokens()
                  }
                  full
                  size="sm"
                  onClick={handleSubmitClick}
                  isLoading={loading}
                  text={`${
                    !hasEnoughStrikeTokens()
                      ? 'Insufficient Strike Tokens to Redeem'
                      : 'Confirm Transaction'
                  }`}
                />
              </>
            )}
          </>
        )}
      </Box>
    </>
  )
}

const StyledTitle = styled.h5`
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px;
`
export default Manage
