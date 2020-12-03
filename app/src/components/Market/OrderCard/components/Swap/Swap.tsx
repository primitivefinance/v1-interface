import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import ethers from 'ethers'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import LineItem from '@/components/LineItem'
import Loader from '@/components/Loader'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'
import Tooltip from '@/components/Tooltip'
import WarningLabel from '@/components/WarningLabel'
import { Operation, UNISWAP_CONNECTOR } from '@/constants/index'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'

import useGuardCap from '@/hooks/transactions/useGuardCap'
import useApprove from '@/hooks/transactions/useApprove'

import useTokenBalance from '@/hooks/useTokenBalance'

import { UNISWAP_ROUTER02_V2 } from '@/lib/constants'

import formatBalance from '@/utils/formatBalance'

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
import formatEtherBalance from '@/utils/formatEtherBalance'

const Swap: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  const removeItem = useRemoveItem()
  // toggle for advanced info
  const [advanced, setAdvanced] = useState(false)
  // approval state
  const { item, orderType, loading, approved } = useItem()

  // inputs for quant
  const { typedValue } = useSwap()
  const { onUserInput } = useSwapActionHandlers()
  const parsedAmount = tryParseAmount(typedValue)
  // web3/
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
    case Operation.LONG:
      title = {
        text: 'Buy Long Tokens',
        tip: 'Purchase and hold option tokens.',
      }
      tokenAddress = underlyingToken.address
      balance = underlyingToken
      break
    case Operation.SHORT:
      title = {
        text: 'Buy Short Tokens',
        tip: 'Purchase tokenized, written covered options.',
      }
      tokenAddress = underlyingToken.address
      balance = underlyingToken
      break
    case Operation.WRITE:
      title = {
        text: 'Write Options',
        tip:
          'Underwrite long option tokens with an underlying token deposit, and sell them for premiums denominated in underlying tokens.',
      }
      tokenAddress = item.entity.address //underlyingToken.address FIX: double approval
      balance = underlyingToken
      break
    case Operation.CLOSE_LONG:
      title = {
        text: 'Close Long Position',
        tip: `Sell option tokens for ${item.asset.toUpperCase()}.`,
      }
      tokenAddress = entity.address
      balance = new Token(entity.chainId, tokenAddress, 18, 'LONG')
      break
    case Operation.CLOSE_SHORT:
      title = {
        text: 'Close Short Position',
        tip: `Sell short option tokens for ${item.asset.toUpperCase()}.`,
      }
      tokenAddress = entity.assetAddresses[2]
      balance = new Token(entity.chainId, tokenAddress, 18, 'SHORT')
      break
    default:
      break
  }
  const tokenBalance = useTokenBalance(tokenAddress)
  const tokenAmount: TokenAmount = new TokenAmount(
    balance,
    parseEther(tokenBalance).toString()
  )
  const spender =
    orderType === Operation.CLOSE_SHORT || orderType === Operation.SHORT
      ? UNISWAP_ROUTER02_V2
      : UNISWAP_CONNECTOR[chainId]
  const underlyingTokenBalance = useTokenBalance(underlyingToken.address)
  const { onApprove } = useApprove(tokenAddress, spender)

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(value)
      console.log(parsedAmount)
    },
    [onUserInput]
  )

  const handleSetMax = useCallback(() => {
    tokenBalance && onUserInput(tokenBalance)
  }, [tokenBalance, onUserInput])

  const handleSubmitClick = useCallback(() => {
    console.log(parsedAmount)
    console.log(typedValue)
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

  const calculateTotalCost = useCallback(() => {
    let debit = '0'
    let credit = '0'
    let short = '0'
    let size = parsedAmount
    const base = item.entity.base.quantity.toString()
    const quote = item.entity.quote.quantity.toString()
    size = item.entity.isCall ? size : size.mul(quote).div(base)
    // buy long
    if (item.premium) {
      debit = premiumMulSize(item.premium.toString(), size)
    }

    // sell long
    if (item.closePremium) {
      credit = premiumMulSize(item.closePremium.toString(), size)
    }

    // buy short && sell short
    if (item.shortPremium) {
      short = premiumMulSize(item.shortPremium.toString(), size)
    }
    return { debit, credit, short }
  }, [item, parsedAmount])

  const calculateProportionalShort = useCallback(() => {
    const sizeWei = parsedAmount
    const base = item.entity.base.quantity.toString()
    const quote = item.entity.quote.quantity.toString()
    const amount = BigNumber.from(sizeWei).mul(quote).div(base)
    return formatEtherBalance(amount)
  }, [item, parsedAmount])

  const isAboveGuardCap = useCallback(() => {
    const inputValue = parsedAmount
    return inputValue ? inputValue.gt(guardCap) && chainId === 1 : false
  }, [parsedAmount, guardCap])

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
      {orderType === Operation.SHORT || orderType === Operation.CLOSE_SHORT ? (
        <LineItem
          label="Short Premium"
          data={formatEther(item.shortPremium)}
          units={entity.isPut ? 'DAI' : item.asset}
        />
      ) : orderType === Operation.WRITE ||
        orderType === Operation.CLOSE_LONG ? (
        <LineItem
          label="Option Premium"
          data={formatEther(item.closePremium)}
          units={entity.isPut ? 'DAI' : item.asset}
        />
      ) : (
        <LineItem
          label="Option Premium"
          data={formatEther(item.premium)}
          units={entity.isPut ? 'DAI' : item.asset}
        />
      )}
      <Spacer size="sm" />
      <PriceInput
        title="Quantity"
        name="primary"
        onChange={handleTypeInput}
        quantity={typedValue}
        onClick={handleSetMax}
        balance={tokenAmount}
        valid={parseEther(underlyingTokenBalance).gt(
          parseEther(calculateTotalCost().debit)
        )}
      />
      <Spacer size="sm" />
      {/* {orderType === Operation.LONG ? (
        <>
          <LineItem
            label={'Total Debit'}
            data={calculateTotalCost().debit}
            units={`- ${entity.isPut ? 'DAI' : item.asset.toUpperCase()}`}
          />
        </>
      ) : orderType === Operation.WRITE ||
        orderType === Operation.CLOSE_LONG ? (
        <>
          <LineItem
            label={'Total Credit'}
            data={calculateTotalCost().credit}
            units={`+ ${entity.isPut ? 'DAI' : item.asset.toUpperCase()}`}
          />
        </>
      ) : orderType === Operation.SHORT ||
        orderType === Operation.CLOSE_SHORT ? (
        <>
          <LineItem
            label={`Total ${
              orderType === Operation.SHORT ? 'Debit' : 'Credit'
            }`}
            data={calculateTotalCost().short}
            units={`${orderType === Operation.SHORT ? '-' : '+'} ${
              entity.isPut ? 'DAI' : item.asset.toUpperCase()
            }`}
          />
        </>
      ) : (
        <></>
      )} */}
      {parsedAmount.gt(0) ? (
        <>
          {' '}
          <Spacer />
          <PurchaseInfo>
            You will{' '}
            <StyledData>
              {orderType === Operation.LONG || orderType === Operation.SHORT
                ? 'BUY'
                : orderType === Operation.WRITE
                ? 'SELL TO OPEN'
                : 'SELL'}
            </StyledData>{' '}
            <StyledData>
              {' '}
              {formatEtherBalance(parsedAmount)}{' '}
              {orderType === Operation.SHORT ||
              orderType === Operation.CLOSE_SHORT
                ? 'SHORT'
                : ''}{' '}
              {entity.isPut ? 'PUT' : 'CALL'}{' '}
            </StyledData>
            {orderType === Operation.CLOSE_LONG ||
            orderType === Operation.CLOSE_SHORT ? (
              <>
                for{' '}
                <StyledData>
                  {' '}
                  {formatBalance(calculateTotalCost().credit)}{' '}
                  {entity.isPut ? item.asset.toUpperCase() : 'DAI'}
                </StyledData>
                .{' '}
              </>
            ) : orderType === Operation.SHORT ? (
              <>
                which gives you the right to right to withdraw{' '}
                <StyledData>
                  {formatEtherBalance(parsedAmount)}{' '}
                  {entity.isPut ? 'DAI' : item.asset.toUpperCase()}
                </StyledData>{' '}
                when the options expire unexercised, or the right to redeem them
                for{' '}
                <StyledData>
                  {' '}
                  {calculateProportionalShort()}{' '}
                  {entity.isPut ? item.asset.toUpperCase() : 'DAI'}
                </StyledData>{' '}
                if they are exercised.{' '}
              </>
            ) : orderType === Operation.WRITE ? (
              <>
                for{' '}
                <StyledData>
                  {' '}
                  {formatBalance(calculateTotalCost().credit)}{' '}
                  {entity.isPut ? item.asset.toUpperCase() : 'DAI'}
                </StyledData>
                .{' '}
              </>
            ) : orderType === Operation.LONG ? (
              <>
                for{' '}
                <StyledData>
                  {' '}
                  {formatBalance(calculateTotalCost().debit)}{' '}
                  {entity.isPut ? item.asset.toUpperCase() : 'DAI'}
                </StyledData>{' '}
                which gives you the right to purchase{' '}
                <StyledData>
                  {formatEtherBalance(parsedAmount)}{' '}
                  {entity.isPut ? 'DAI' : item.asset.toUpperCase()}
                </StyledData>{' '}
                for{' '}
                <StyledData>
                  {' '}
                  {calculateProportionalShort()}{' '}
                  {entity.isPut ? item.asset.toUpperCase() : 'DAI'}
                </StyledData>
                .{' '}
              </>
            ) : (
              <>
                which gives you the right to purchase{' '}
                <StyledData>
                  {formatEtherBalance(parsedAmount)}{' '}
                  {entity.isPut ? 'DAI' : item.asset.toUpperCase()}
                </StyledData>{' '}
                for{' '}
                <StyledData>
                  {' '}
                  {calculateProportionalShort()}{' '}
                  {entity.isPut ? item.asset.toUpperCase() : 'DAI'}
                </StyledData>
                .{' '}
              </>
            )}
          </PurchaseInfo>
        </>
      ) : (
        <> </>
      )}

      <IconButton
        text="Advanced"
        variant="transparent"
        onClick={() => setAdvanced(!advanced)}
      >
        {advanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
      <Spacer size="sm" />

      {advanced ? ( // FIX
        <>
          <LineItem label="Price Impact" data={``} />
          <Spacer />
        </>
      ) : (
        <> </>
      )}

      {isAboveGuardCap() ? (
        <>
          <div style={{ marginTop: '-.5em' }} />
          <WarningLabel>
            This amount of tokens is above our guardrail cap of $100,000
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
            {orderType === Operation.MINT ? (
              <>
                {approved[0] ? (
                  <></>
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
                {approved[1] ? (
                  <></>
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
              </>
            ) : (
              <>
                {approved[0] ? (
                  <></>
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
              </>
            )}

            <Button
              disabled={
                !approved[0] ||
                !parsedAmount?.gt(0) ||
                loading ||
                isAboveGuardCap()
              }
              full
              size="sm"
              onClick={handleSubmitClick}
              isLoading={loading}
              text="Confirm Transaction"
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

const PurchaseInfo = styled.span`
  color: ${(props) => props.theme.color.grey[400]};
`

const StyledData = styled.span`
  color: ${(props) => props.theme.color.white};
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
`

export default Swap
