import React, { useState, useCallback, useEffect } from 'react'
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
import { Operation, UNISWAP_CONNECTOR } from '@/constants/index'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import WarningIcon from '@material-ui/icons/Warning'
import useGuardCap from '@/hooks/transactions/useGuardCap'
import useApprove from '@/hooks/transactions/useApprove'
import { useReserves } from '@/hooks/data'
import useTokenBalance from '@/hooks/useTokenBalance'

import { UNISWAP_ROUTER02_V2 } from '@/lib/constants'
import { Trade } from '@/lib/entities'

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
  useSetSwapLoaded,
} from '@/state/swap/hooks'
import { usePrice } from '@/state/price/hooks'
import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount } from '@uniswap/sdk'
import formatEtherBalance from '@/utils/formatEtherBalance'

const Swap: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  const removeItem = useRemoveItem()
  // approval state
  const { item, orderType, loading, approved } = useItem()
  // cost state
  const [cost, setCost] = useState({
    debit: '0',
    credit: '0',
    short: '0',
  })
  const [prem, setPrem] = useState(
    orderType === Operation.LONG
      ? formatEther(item.market.spotOpenPremium.raw.toString())
      : orderType === Operation.CLOSE_LONG || orderType === Operation.WRITE
      ? formatEther(item.market.spotClosePremium.raw.toString())
      : orderType === Operation.SHORT
      ? formatEther(item.market.spotUnderlyingToShort.raw.toString())
      : formatEther(item.market.spotShortToUnderlying.raw.toString())
  )
  const [impact, setImpact] = useState('0.00')
  const [error, setError] = useState(false)
  // set null lp
  const [hasLiquidity, setHasL] = useState(false)
  // inputs for quant
  const { typedValue, inputLoading } = useSwap()
  const { onUserInput } = useSwapActionHandlers()
  const parsedAmount = tryParseAmount(typedValue)
  const swapLoaded = useSetSwapLoaded()
  // web3
  const { library, chainId } = useWeb3React()
  const addNotif = useAddNotif()
  // guard cap
  const guardCap = useGuardCap(item.asset, orderType)
  // price
  const price = usePrice()
  // pair and option entities
  const entity = item.entity
  const lpPair = useReserves(entity.underlying, entity.redeem).data
  // has liquidity?
  useEffect(() => {
    if (lpPair) {
      setHasL(lpPair.reserveOf(entity.redeem).numerator[2])
    }
  }, [setHasL, lpPair])

  let title = { text: '', tip: '' }
  let tokenAddress: string
  let secondaryAddress: string | null
  let balance: Token
  switch (orderType) {
    case Operation.LONG:
      title = {
        text: 'Buy Long Tokens',
        tip: 'Purchase and hold option tokens',
      }
      tokenAddress = entity.underlying.address
      balance = entity.underlying
      break
    case Operation.SHORT:
      title = {
        text: 'Buy Short Tokens',
        tip: 'Purchase tokenized, written covered options',
      }
      tokenAddress = entity.underlying.address
      balance = entity.underlying
      break
    case Operation.WRITE:
      title = {
        text: 'Write Options',
        tip:
          'Underwrite long option tokens with an underlying token deposit, and sell them for premiums denominated in underlying tokens',
      }
      tokenAddress = entity.address
      secondaryAddress = entity.underlying.address
      balance = entity.underlying
      break
    case Operation.CLOSE_LONG:
      title = {
        text: 'Close Long Position',
        tip: `Sell option tokens for ${item.asset.toUpperCase()}`,
      }
      tokenAddress = entity.address
      balance = new Token(entity.chainId, tokenAddress, 18, 'LONG')
      break
    case Operation.CLOSE_SHORT:
      title = {
        text: 'Close Short Position',
        tip: `Sell short option tokens for ${item.asset.toUpperCase()}`,
      }
      tokenAddress = entity.redeem.address
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
  const underlyingTokenBalance = useTokenBalance(entity.underlying.address)
  const onApprove = useApprove()

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(value)
    },
    [onUserInput]
  )

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

  useEffect(() => {
    const calculateTotalCost = async () => {
      let debit = '0'
      let credit = '0'
      let short = '0'
      const size = parsedAmount
      const base = entity.baseValue.raw.toString()
      const quote = entity.quoteValue.raw.toString()
      let actualPremium: TokenAmount
      let spot: TokenAmount
      let slippage
      try {
        if (orderType === Operation.LONG) {
          if (parsedAmount.gt(BigNumber.from(0))) {
            ;[spot, actualPremium, slippage] = item.market.getExecutionPrice(
              orderType,
              size
            )
            setImpact(slippage)
            setPrem(formatEther(spot.raw.toString()))
            debit = formatEther(actualPremium.raw.toString())
          } else {
            setImpact('0.00')
            setPrem(formatEther(item.market.spotOpenPremium.raw.toString()))
          }
          // sell long, Trade.getClosePremium
        } else if (
          orderType === Operation.CLOSE_LONG ||
          orderType === Operation.WRITE
        ) {
          if (parsedAmount.gt(BigNumber.from(0))) {
            ;[spot, actualPremium, slippage] = item.market.getExecutionPrice(
              orderType,
              size
            )
            setImpact(slippage)
            setPrem(formatEther(spot.raw.toString()))
            credit = formatEther(actualPremium.raw.toString())
          } else {
            setImpact('0.00')
            setPrem(formatEther(item.market.spotClosePremium.raw.toString()))
          }
          // buy short swap from UNDER -> RDM
        } else if (orderType === Operation.SHORT) {
          if (parsedAmount.gt(BigNumber.from(0))) {
            ;[spot, actualPremium, slippage] = item.market.getExecutionPrice(
              orderType,
              size
            )
            setImpact(slippage)
            setPrem(
              formatEther(item.market.spotUnderlyingToShort.raw.toString())
            )
            short = formatEther(actualPremium.raw.toString())
          } else {
            setImpact('0.00')
            setPrem(
              formatEther(item.market.spotUnderlyingToShort.raw.toString())
            )
          }
          // sell short, RDM -> UNDER
        } else if (orderType === Operation.CLOSE_SHORT) {
          if (parsedAmount.gt(BigNumber.from(0))) {
            ;[spot, actualPremium, slippage] = item.market.getExecutionPrice(
              orderType,
              size
            )
            setImpact(slippage)
            setPrem(
              formatEther(item.market.spotShortToUnderlying.raw.toString())
            )
            short = formatEther(actualPremium.raw.toString())
          } else {
            setImpact('0.00')
            setPrem(
              formatEther(item.market.spotShortToUnderlying.raw.toString())
            )
          }
        }
        setError(false)
      } catch (e) {
        setError(true)
      }
      swapLoaded()
      setCost({ debit, credit, short })
    }
    if (lpPair && inputLoading) {
      calculateTotalCost()
    }
  }, [item, parsedAmount, inputLoading, lpPair])

  const calculateProportionalShort = useCallback(() => {
    const sizeWei = parsedAmount
    return formatEtherBalance(entity.proportionalShort(sizeWei))
  }, [item, parsedAmount])

  const isAboveGuardCap = useCallback(() => {
    const inputValue = parsedAmount
    return inputValue ? inputValue.gt(guardCap) && chainId === 1 : false
  }, [parsedAmount, guardCap])

  const handleApproval = useCallback(() => {
    onApprove(tokenAddress, spender)
      .then()
      .catch((error) => {
        addNotif(0, `Approving ${item.asset.toUpperCase()}`, error.message, '')
      })
  }, [item, onApprove])

  const handleSecondaryApproval = useCallback(() => {
    onApprove(secondaryAddress, spender)
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
      <Box column alignItems="center">
        <Spacer size="sm" />
        {hasLiquidity ? null : (
          <WarningTooltip>
            <WarningIcon />
            <Spacer size="sm" />
            <h5>There is no liquidity in this option market</h5>
          </WarningTooltip>
        )}
        {!inputLoading ? (
          <>
            {orderType === Operation.SHORT ||
            orderType === Operation.CLOSE_SHORT ? (
              <LineItem
                label="Short Premium"
                data={formatBalance(prem)}
                units={entity.isPut ? 'DAI' : item.asset}
              />
            ) : orderType === Operation.WRITE ||
              orderType === Operation.CLOSE_LONG ? (
              <LineItem
                label="Option Premium"
                data={formatBalance(prem)}
                units={entity.isPut ? 'DAI' : item.asset}
              />
            ) : (
              <LineItem
                label="Option Premium"
                data={formatBalance(prem)}
                units={entity.isPut ? 'DAI' : item.asset}
              />
            )}
          </>
        ) : (
          <Loader />
        )}

        <Spacer size="sm" />
        <PriceInput
          title="Quantity"
          name="primary"
          onChange={handleTypeInput}
          quantity={typedValue}
          onClick={handleSetMax}
          balance={tokenAmount}
          valid={parseEther(underlyingTokenBalance).gt(parseEther(cost.debit))}
        />
        <Spacer size="sm" />
        {inputLoading ? (
          <Loader />
        ) : (
          <LineItem label="Slippage" data={`${impact}`} units="%" />
        )}
        {parsedAmount.gt(0) ? (
          <StyledSummary column alignItems="center">
            {parsedAmount.gt(0) && !error ? (
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
                {orderType === Operation.CLOSE_LONG ? (
                  <>
                    for{' '}
                    <StyledData>
                      {' '}
                      {formatBalance(cost.credit)}{' '}
                      {entity.isPut ? 'DAI' : item.asset.toUpperCase()}
                    </StyledData>
                    .{' '}
                  </>
                ) : orderType === Operation.CLOSE_SHORT ? (
                  <>
                    for{' '}
                    <StyledData>
                      {' '}
                      {formatBalance(cost.short)}{' '}
                      {entity.isPut ? 'DAI' : item.asset.toUpperCase()}
                    </StyledData>
                    .{' '}
                  </>
                ) : orderType === Operation.SHORT ? (
                  <>
                    for{' '}
                    <StyledData>
                      {' '}
                      {formatBalance(cost.short)}{' '}
                      {entity.isPut ? 'DAI' : item.asset.toUpperCase()}
                    </StyledData>{' '}
                    which gives you the right to right to withdraw{' '}
                    <StyledData>
                      {formatEtherBalance(parsedAmount)}{' '}
                      {entity.isPut ? 'DAI' : item.asset.toUpperCase()}
                    </StyledData>{' '}
                    when the options expire unexercised, or the right to redeem
                    them for{' '}
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
                      {formatBalance(cost.credit)}{' '}
                      {entity.isPut ? 'DAI' : item.asset.toUpperCase()}
                    </StyledData>
                    .{' '}
                  </>
                ) : orderType === Operation.LONG ? (
                  <>
                    for{' '}
                    <StyledData>
                      {' '}
                      {formatBalance(cost.debit)}{' '}
                      {entity.isPut ? 'DAI' : item.asset.toUpperCase()}
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
            ) : (
              <>
                <Spacer />
                {error ? (
                  <StyledError>Order quantity too large!</StyledError>
                ) : null}
              </>
            )}
          </StyledSummary>
        ) : null}
        <Spacer />
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

        <StyledEnd row justifyContent="flex-start">
          {loading ? (
            <div style={{ width: '100%' }}>
              <Box column alignItems="center" justifyContent="center">
                <Loader />
              </Box>
            </div>
          ) : (
            <>
              {orderType === Operation.WRITE ? (
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
                        text="Approve Options"
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
                        onClick={handleSecondaryApproval}
                        isLoading={loading}
                        text="Approve Tokens"
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
                  isAboveGuardCap() ||
                  error
                }
                full
                size="sm"
                onClick={handleSubmitClick}
                isLoading={loading}
                text="Confirm Transaction"
              />
            </>
          )}
        </StyledEnd>
      </Box>
    </>
  )
}

const StyledSummary = styled(Box)`
  min-width: 100%;
`
const StyledEnd = styled(Box)`
  min-width: 100%;
`
const WarningTooltip = styled.div`
  color: yellow;
  font-size: 18px;
  display: flex;
  align-items: center;
`
const StyledTitle = styled.h5`
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px;
`

const PurchaseInfo = styled.span`
  color: ${(props) => props.theme.color.grey[400]};
  margin-top: 1em;
`
const StyledError = styled.span`
  color: ${(props) => props.theme.color.red[500]};
  font-size: 18px;
  margin-bottom: -0.3em;
  font-weight: 600;
`
const StyledData = styled.span`
  color: ${(props) => props.theme.color.white};
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
`
export default Swap
