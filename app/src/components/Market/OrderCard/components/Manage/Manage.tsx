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

import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount } from '@uniswap/sdk'

const Manage: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  const removeItem = useRemoveItem()
  // approval state
  const { item, orderType, approved, loading, lpApproved } = useItem()
  const txs = useAllTransactions()

  // inputs for user quantity
  const [inputs, setInputs] = useState({
    primary: '',
    secondary: '',
  })
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

  const strikeBalance = useTokenBalance(
    entity.assetAddresses[2],
    entity.address
  )

  const handleInputChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setInputs({
        ...inputs,
        [e.currentTarget.name]: e.currentTarget.value,
      })
    },
    [setInputs, inputs]
  )

  // FIX
  const handleSetMax = () => {
    const max =
      ((+underlyingTokenBalance / (+item.premium + Number.EPSILON)) * 100) / 100

    setInputs({
      ...inputs,
      primary: parseFloat(tokenBalance).toFixed(10).toString(),
    })
  }

  const handleSubmitClick = useCallback(() => {
    const imp = BigInt(
      (parseFloat(inputs.primary) * 1000000000000000000).toString()
    )
    console.log(imp.toString())
    console.log(
      BigInt(parseFloat(tokenBalance) * 1000000000000000000).toString()
    )
    submitOrder(
      library,
      item?.address,
      imp,
      orderType,
      BigInt(inputs.secondary)
    )
    removeItem()
  }, [submitOrder, removeItem, item, library, inputs, orderType])

  const premiumMulSize = (premium, size) => {
    const premiumWei = BigNumber.from(premium)
    if (size === '') return '0'
    const sizeWei = parseEther(parseFloat(size).toString())
    const debit = formatEther(
      premiumWei.mul(sizeWei).div(parseEther('1')).toString()
    )
    return debit
  }

  const calculateCosts = useCallback(() => {
    let long = '0'
    let short = '0'
    let underlying = '0'
    let strike = '0'
    let size = inputs.primary === '' ? '0' : inputs.primary
    const base = item.entity.base.quantity.toString()
    const quote = item.entity.quote.quantity.toString()
    switch (orderType) {
      case Operation.MINT:
        long = size
        short = BigNumber.from(size).mul(quote).div(base).toString()
        underlying = long
        break
      case Operation.EXERCISE:
        long = size
        underlying = long
        strike = BigNumber.from(size).mul(quote).div(base).toString()
        break
      case Operation.REDEEM:
        short = size
        strike = short
        break
      case Operation.CLOSE:
        long = size
        underlying = long
        short = BigNumber.from(size).mul(quote).div(base).toString()
        break
      default:
        break
    }
    return { long, short, underlying, strike }
  }, [item, inputs, orderType])

  const isAboveGuardCap = useCallback(() => {
    const inputValue =
      inputs.primary !== ''
        ? parseEther(parseFloat(inputs.primary).toString())
        : parseEther('0')
    return BigNumber.from(inputValue).gt(guardCap) && chainId === 1
  }, [inputs, guardCap])

  const hasEnoughStrikeTokens = useCallback(() => {
    const inputValue =
      inputs.primary !== ''
        ? parseEther(parseFloat(inputs.primary).toString())
        : parseEther('0')
    if (orderType === Operation.REDEEM) {
      return parseEther(parseFloat(strikeBalance).toString()).gt(
        BigNumber.from(inputValue)
      )
    } else {
      return true
    }
  }, [inputs, strikeBalance])

  const handleApproval = useCallback(() => {
    onApprove()
      .then()
      .catch((error) => {
        addNotif(0, `Approving ${item.asset.toUpperCase()}`, error.message, '')
      })
  }, [inputs, onApprove])

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
        quantity={inputs.primary}
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
            {approved ? (
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
                !approved ||
                !inputs.primary ||
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
