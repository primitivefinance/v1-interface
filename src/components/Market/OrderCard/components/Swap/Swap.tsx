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
import Toggle from '@/components/Toggle'
import ToggleButton from '@/components/ToggleButton'
import ClearIcon from '@material-ui/icons/Clear'
import { Operation, UNISWAP_CONNECTOR } from '@/constants/index'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'

import useGuardCap from '@/hooks/transactions/useGuardCap'
import useApprove from '@/hooks/transactions/useApprove'
import useTokenBalance from '@/hooks/useTokenBalance'
import { useSlippage } from '@/state/user/hooks'

import { UNI_ROUTER_ADDRESS } from '@primitivefi/sdk'

import formatBalance from '@/utils/formatBalance'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import formatExpiry from '@/utils/formatExpiry'

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
  useSetSwapLoaded,
} from '@/state/swap/hooks'
import { usePrice } from '@/state/price/hooks'
import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount } from '@uniswap/sdk'
import formatEtherBalance from '@/utils/formatEtherBalance'
import numeral from 'numeral'
import { tryParseAmount } from '@/utils/tryParseAmount'

const Swap: React.FC = () => {
  //state
  const [description, setDescription] = useState(false)
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  // approval state
  const { item, orderType, loading, approved } = useItem()
  const [active, setCallActive] = useState(
    orderType === Operation.LONG ? true : false
  )

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
      : formatEther(item.market.spotUnderlyingToShort.raw.toString())
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

  // slippage
  const slippage = useSlippage()
  // pair and option entities
  const entity = item.entity
  // has liquidity?
  useEffect(() => {
    if (item.market) {
      setHasL(item.market.hasLiquidity)
    } else {
      swapLoaded()
    }
  }, [setHasL, item.market])

  let title = { text: '', tip: '' }
  let tokenAddress: string
  let secondaryAddress: string | null
  let balance: Token
  switch (orderType) {
    case Operation.LONG:
      title = {
        text: `Trade ${numeral(item.entity.strikePrice).format(
          +item.entity.strikePrice > 1 ? '$0' : '$0.00'
        )} ${item.entity.isCall ? 'Call' : 'Put'} ${formatExpiry(
          item.entity.expiryValue
        ).utc.substr(4, 12)}`,
        tip: 'Purchase and hold option tokens',
      }
      tokenAddress = entity.underlying.address
      balance = entity.underlying
      break
    case Operation.SHORT:
      title = {
        text: 'Buy Short Options',
        tip: 'Purchase tokenized, written covered options',
      }
      tokenAddress = entity.underlying.address
      balance = entity.underlying
      break
    case Operation.WRITE:
      title = {
        text: `Trade ${numeral(item.entity.strikePrice).format(
          +item.entity.strikePrice > 1 ? '$0' : '$0.00'
        )} ${item.entity.isCall ? 'Call' : 'Put'} ${formatExpiry(
          item.entity.expiryValue
        ).utc.substr(4, 12)}`,
        tip:
          'Underwrite long option tokens with an underlying token deposit, and sell them for premiums denominated in underlying tokens',
      }
      tokenAddress = entity.underlying.address
      secondaryAddress = entity.address
      balance = entity.underlying
      break
    case Operation.CLOSE_LONG:
      title = {
        text: `Trade ${numeral(item.entity.strikePrice).format(
          +item.entity.strikePrice > 1 ? '$0' : '$0.00'
        )} ${item.entity.isCall ? 'Call' : 'Put'} ${formatExpiry(
          item.entity.expiryValue
        ).utc.substr(4, 12)}`,
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
      ? UNI_ROUTER_ADDRESS
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

  const handleToggleClick = useCallback(() => {
    setCallActive(!active)
    updateItem(item, !active ? Operation.LONG : Operation.CLOSE_LONG)
  }, [active, setCallActive])

  const handleSubmitClick = useCallback(() => {
    submitOrder(
      library,
      BigInt(parsedAmount.toString()),
      orderType,
      BigInt('0')
    )
  }, [submitOrder, item, library, parsedAmount, orderType])

  useEffect(() => {
    const calculateTotalCost = async () => {
      let debit = '0'
      let credit = '0'
      let short = '0'
      const size = parsedAmount
      let actualPremium: TokenAmount
      let spot: TokenAmount
      let slip
      try {
        if (orderType === Operation.LONG) {
          if (parsedAmount.gt(BigNumber.from(0))) {
            ;[spot, actualPremium, slip] = item.market.getExecutionPrice(
              orderType,
              size
            )
            setImpact(slip)
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
            ;[spot, actualPremium, slip] = item.market.getExecutionPrice(
              orderType,
              size
            )
            setImpact(slip)
            setPrem(formatEther(spot.raw.toString()))
            credit = formatEther(actualPremium.raw.toString())
          } else {
            setImpact('0.00')
            setPrem(formatEther(item.market.spotClosePremium.raw.toString()))
          }
          // buy short swap from UNDER -> RDM
        } else if (orderType === Operation.SHORT) {
          if (parsedAmount.gt(BigNumber.from(0))) {
            ;[spot, actualPremium, slip] = item.market.getExecutionPrice(
              orderType,
              size
            )
            setImpact(slip)
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
            ;[spot, actualPremium, slip] = item.market.getExecutionPrice(
              orderType,
              size
            )
            setImpact(slip)
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
        }
        setError(false)
      } catch (e) {
        setError(true)
      }
      swapLoaded()
      setCost({ debit, credit, short })
    }
    if (item.market && inputLoading) {
      calculateTotalCost()
    }
  }, [item, parsedAmount, inputLoading, item.market])

  const calculateProportionalShort = useCallback(() => {
    const sizeWei = parsedAmount
    return formatEtherBalance(entity.proportionalShort(sizeWei))
  }, [item, parsedAmount])

  const isBelowSlippage = useCallback(() => {
    return impact !== 'NaN'
      ? Math.abs(parseFloat(impact)) < parseFloat(slippage) * 100
      : true
  }, [impact, slippage])

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

  const CustomButton = styled.div`
    margin-top: -0.1em;
    background: none;
  `

  const removeItem = useRemoveItem()

  return (
    <>
      <Box column alignItems="center">
        <StyledTitle>
          <Tooltip text={title.tip}>{title.text}</Tooltip>
          <CustomButton>
            <Button
              variant="transparent"
              size="sm"
              onClick={() => removeItem()}
            >
              <ClearIcon />
            </Button>
          </CustomButton>
        </StyledTitle>

        <Separator />
        <Spacer size="sm" />

        <StyledToggleContainer>
          <StyledFilterBarInner>
            <Toggle full>
              <ToggleButton
                active={active}
                onClick={handleToggleClick}
                text="Buy"
              />
              <ToggleButton
                active={!active}
                onClick={handleToggleClick}
                text="Sell"
              />
            </Toggle>
          </StyledFilterBarInner>
        </StyledToggleContainer>

        {hasLiquidity ? null : (
          <>
            <Spacer />
            <WarningTooltip>
              There is no liquidity in this option market
            </WarningTooltip>
          </>
        )}
        <Spacer />
        <PriceInput
          title="Quantity"
          name="primary"
          onChange={handleTypeInput}
          quantity={typedValue}
          onClick={handleSetMax}
          balance={tokenAmount}
          valid={parseEther(underlyingTokenBalance).gt(parseEther(cost.debit))}
        />
        <Spacer />
        <StyledTitle>Order Summary</StyledTitle>
        {!inputLoading ? (
          <>
            <LineItem
              label="Price"
              data={formatBalance(prem)}
              units={entity.isPut ? 'DAI' : item.asset}
              tip="The price per 1 option token."
            />
          </>
        ) : (
          <>{hasLiquidity ? <Loader /> : null}</>
        )}
        <Spacer size="sm" />
        {inputLoading && hasLiquidity ? (
          <>
            <Loader />
            <Spacer />
          </>
        ) : (
          <LineItem
            label={isBelowSlippage() ? 'Slippage' : 'Slippage too high'}
            data={`${Math.abs(parseFloat(impact)).toString()}`}
            units="%"
            color={isBelowSlippage() ? null : 'red'}
            tip="The % change in the price paid."
          />
        )}
        <Spacer />
        <StyledEnd row justifyContent="flex-start">
          {loading ? (
            <div style={{ width: '100%' }}>
              <Button
                disabled={loading}
                full
                size="sm"
                onClick={handleApproval}
                isLoading={loading}
                text="Confirm"
              />
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
                  {approved[0] && approved[1] ? (
                    <Button
                      disabled={
                        !parsedAmount?.gt(0) ||
                        error ||
                        !hasLiquidity ||
                        !isBelowSlippage()
                      }
                      full
                      size="sm"
                      onClick={handleSubmitClick}
                      isLoading={loading}
                      text="Confirm"
                    />
                  ) : null}
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
                  <Button
                    disabled={
                      !approved[0] ||
                      !parsedAmount?.gt(0) ||
                      error ||
                      !hasLiquidity ||
                      !isBelowSlippage()
                    }
                    full
                    size="sm"
                    onClick={handleSubmitClick}
                    isLoading={loading}
                    text={'Confirm'}
                  />
                </>
              )}
            </>
          )}
        </StyledEnd>

        {error ? (
          <StyledSummary column alignItems="flex-start">
            <PurchaseInfo>
              <StyledSpan>
                <Spacer />
                <WarningLabel>Order quantity too large!</WarningLabel>
              </StyledSpan>
            </PurchaseInfo>
          </StyledSummary>
        ) : null}

        <Spacer />
        <IconButton
          text=""
          full
          variant="transparent"
          onClick={() => {
            setDescription(!description)
          }}
        >
          <StyledInnerTitle>Description</StyledInnerTitle>
          {description ? <ExpandLessIcon /> : <ExpandMoreIcon />}{' '}
        </IconButton>

        {parsedAmount.eq(0) && !error && description ? (
          <StyledSummary column alignItems="flex-start">
            <PurchaseInfo>
              <StyledSpan>Enter an amount of options to trade.</StyledSpan>
            </PurchaseInfo>
          </StyledSummary>
        ) : (
          <> </>
        )}

        {parsedAmount.gt(0) && description ? (
          <StyledSummary column alignItems="flex-start">
            {parsedAmount.gt(0) && !error ? (
              <PurchaseInfo>
                <StyledSpan>
                  You will{' '}
                  <StyledData>
                    {orderType === Operation.LONG ||
                    orderType === Operation.SHORT
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
                      which gives you the right to withdraw{' '}
                      <StyledData>
                        {entity.isPut
                          ? formatEtherBalance(
                              parsedAmount.mul(entity.strikePrice)
                            )
                          : formatEtherBalance(
                              parsedAmount.div(entity.strikePrice)
                            )}{' '}
                        {entity.isPut ? 'DAI' : item.asset.toUpperCase()}
                      </StyledData>{' '}
                      when the options expire unexercised, or the right to
                      redeem them for{' '}
                      <StyledData>
                        {' '}
                        {formatEtherBalance(parsedAmount)}{' '}
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
                </StyledSpan>
              </PurchaseInfo>
            ) : (
              <>
                <PurchaseInfo>
                  <StyledSpan>The order size is too large.</StyledSpan>
                </PurchaseInfo>
              </>
            )}
          </StyledSummary>
        ) : null}
        <Spacer size="sm" />
      </Box>
    </>
  )
}

const Separator = styled.div`
  border: 1px solid ${(props) => props.theme.color.grey[600]};
  width: 100%;
`

const StyledFilterBarInner = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  height: ${(props) => props.theme.barHeight}px;
  width: 100%;
`

const StyledToggleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`

const StyledSpan = styled.span`
  color: ${(props) => props.theme.color.grey[400]};
`

const StyledSummary = styled(Box)`
  display: flex;
  flex: 1;
  min-width: 100%;
  margin-bottom: ${(props) => props.theme.spacing[3]}px;
`
const StyledEnd = styled(Box)`
  min-width: 100%;
`
const WarningTooltip = styled.div`
  color: yellow;
  font-size: 18px;
  display: table;
  align-items: center;
  justify-content: center;
  width: 100%;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-align: center;
  vertical-align: middle;
  font-size: 14px;
  opacity: 1;
`
const StyledTitle = styled.div`
  align-items: center;
  color: ${(props) => props.theme.color.white};
  font-size: 16px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px;
  display: flex;
  flex: 1;
  width: 100%;
  letter-spacing: 0.5px;
  justify-content: space-between;
`

const StyledInnerTitle = styled.div`
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
  font-weight: 700;
  display: flex;
  flex: 1;
  width: 100%;
  letter-spacing: 0.5px;
`

const PurchaseInfo = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
  vertical-align: middle;
  display: table;
  margin-bottom: -1em;
`

const StyledData = styled.span`
  color: ${(props) => props.theme.color.white};
  font-size: 16px;
  font-weight: 500;
  text-transform: uppercase;
`
export default Swap
