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

import useGuardCap from '@/hooks/transactions/useGuardCap'

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
import {
  useSwapActionHandlers,
  useSwap,
  tryParseAmount,
} from '@/state/swap/hooks'
import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount } from '@uniswap/sdk'

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
  const { typedValue } = useSwap()
  const { onUserInput } = useSwapActionHandlers()
  const parsedAmount = tryParseAmount(typedValue)
  // web3
  const { library, chainId } = useWeb3React()
  const addNotif = useAddNotif()
  // guard cap
  const guardCap = useGuardCap(item.asset, orderType)

  // pair and option entities
  const entity = item.entity
  const underlyingToken: Token = new Token(
    entity.chainId,
    entity.assetAddresses[0],
    18,
    entity.isPut ? 'DAI' : item.asset.toUpperCase()
  )

  let title = { text: '', tip: '' }
  let tokenAddress: string
  let balance: Token
  switch (orderType) {
    case Operation.MINT:
      title = {
        text: 'Mint Options',
        tip: 'Deposit underlying tokens to mint long and short option tokens.',
      }
      tokenAddress = underlyingToken.address
      balance = underlyingToken
      break
    case Operation.EXERCISE:
      title = {
        text: 'Exercise Options',
        tip:
          'Pay strike price and burn option tokens to release underlying tokens.',
      }
      tokenAddress = entity.address // entity.assetAddresses[1] FIX DOUBLE APPROVAL
      balance = new Token(entity.chainId, tokenAddress, 18, 'OPTION')
      break
    case Operation.REDEEM:
      title = {
        text: 'Redeem Strike Tokens',
        tip: `Burn short option tokens to release strike tokens, if options were exercised.`,
      }
      tokenAddress = entity.assetAddresses[2]
      balance = new Token(entity.chainId, tokenAddress, 18, 'REDEEM')
      break
    case Operation.CLOSE:
      title = {
        text: 'Close Options',
        tip: `Burn long and short option tokens to receive underlying tokens.`,
      }
      tokenAddress = entity.address // entity.assetAddresses[2] FIX DOUBLE APPROVAL
      balance = new Token(entity.chainId, tokenAddress, 18, 'OPTION')
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
  const { onApprove } = useApprove(tokenAddress, spender)

  const strikeBalance = useTokenBalance(entity.assetAddresses[2])

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
      item?.address,
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
    console.log(debit)
    return debit
  }

  const calculateCosts = useCallback(() => {
    let long = '0'
    let short = '0'
    let underlying = '0'
    let strike = '0'
    const size = parsedAmount
    const base = item.entity.base.quantity.toString()
    const quote = item.entity.quote.quantity.toString()
    switch (orderType) {
      case Operation.MINT:
        long = size.toString()
        short = size.mul(quote).div(base).toString()
        underlying = long
        break
      case Operation.EXERCISE:
        long = size.toString()
        underlying = long
        strike = size.mul(quote).div(base).toString()
        break
      case Operation.REDEEM:
        short = size.toString()
        strike = short
        break
      case Operation.CLOSE:
        long = size.toString()
        underlying = long
        short = size.mul(quote).div(base).toString()
        break
      default:
        break
    }
    return { long, short, underlying, strike }
  }, [item, orderType, parsedAmount])

  const isAboveGuardCap = useCallback(() => {
    const inputValue = parsedAmount
    return inputValue ? inputValue.gt(guardCap) && chainId === 1 : false
  }, [parsedAmount, guardCap])

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

  const handleApproval = useCallback(() => {
    onApprove()
      .then()
      .catch((error) => {
        addNotif(0, `Approving ${item.asset.toUpperCase()}`, error.message, '')
      })
  }, [item, onApprove])

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
          parseEther(calculateCosts().long) // fix, should also check for options
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
          <LineItem
            label={'Burn'}
            data={calculateCosts().long}
            units={`- LONG`}
          />
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

      {isAboveGuardCap() ? (
        <>
          <div style={{ marginTop: '-.5em' }} />
          <WarningLabel>
            This amount of underlying tokens is above our guardrail cap of
            $10,000
          </WarningLabel>
          <Spacer size="sm" />
        </>
      ) : (
        <></>
      )}

      <Box row justifyContent="flex-start">
        {loading ? (
          <div style={{ width: '100%' }}>
            <Box column alignItems="center" justifyContent="center">
              <Loader />
            </Box>
          </div>
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
                isAboveGuardCap() ||
                !hasEnoughStrikeTokens()
              }
              full
              size="sm"
              onClick={handleSubmitClick}
              isLoading={loading}
              text={`${
                !hasEnoughStrikeTokens()
                  ? 'Insufficient Strike Tokens to Redeem'
                  : 'Confirm'
              }`}
            />
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
