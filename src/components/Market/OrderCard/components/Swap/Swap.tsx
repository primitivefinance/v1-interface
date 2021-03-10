import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import LineItem from '@/components/LineItem'
import Loader from '@/components/Loader'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'
import WarningLabel from '@/components/WarningLabel'
import Title from '@/components/Title'
import Description from '@/components/Description'
import CardHeader from '@/components/CardHeader'
import Switch from '@/components/Switch'
import Separator from '@/components/Separator'
import OptionTextInfo from '@/components/OptionTextInfo'
import { Operation, SignitureData, WETH9 } from '@primitivefi/sdk'

import { BigNumber, BigNumberish, ethers } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'

import useApprove from '@/hooks/transactions/useApprove'
import { useDAIPermit, usePermit } from '@/hooks/transactions/usePermit'
import useTokenBalance from '@/hooks/useTokenBalance'
import { useSlippage } from '@/state/user/hooks'

import {
  ADDRESS_ZERO,
  Venue,
  SUSHI_ROUTER_ADDRESS,
  PRIMITIVE_ROUTER,
} from '@primitivefi/sdk'

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
import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount } from '@sushiswap/sdk'
import formatEtherBalance from '@/utils/formatEtherBalance'
import numeral from 'numeral'
import { tryParseAmount } from '@/utils/tryParseAmount'
import { sign } from 'crypto'
import useBalance from '@/hooks/useBalance'
const formatParsedAmount = (amount: BigNumberish) => {
  const bigAmt = BigNumber.from(amount)
  return numeral(formatEther(bigAmt)).format(
    bigAmt.lt(parseEther('0.01')) ? '0.0000' : '0.00'
  )
}

const Swap: React.FC = () => {
  //state
  const [description, setDescription] = useState(false)
  const [signData, setSignData] = useState<SignitureData>(null)
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  // approval state
  const { item, orderType, loading, approved } = useItem()

  // slippage
  const slippage = useSlippage()
  // pair and option entities
  const entity = item.entity
  // multiply by quote divide by base, scale to quote units
  const scaleUp = (amount) => {
    return BigNumber.from(amount.toString())
      .mul(entity.quoteValue.raw.toString())
      .div(entity.baseValue.raw.toString())
  }

  // multiply by base divide by quote, scale to base units
  const scaleDown = (amount) => {
    return BigNumber.from(amount.toString())
      .mul(entity.baseValue.raw.toString())
      .div(entity.quoteValue.raw.toString())
  }

  const getSpotPremiums = useCallback(() => {
    return orderType === Operation.LONG
      ? formatEther(
          entity.isPut
            ? scaleDown(item.market.spotOpenPremium.raw.toString())
            : item.market.spotOpenPremium.raw.toString()
        )
      : orderType === Operation.CLOSE_LONG
      ? formatEther(
          entity.isPut
            ? scaleUp(item.market.spotClosePremium.raw.toString())
            : item.market.spotClosePremium.raw.toString()
        )
      : formatEther(
          entity.isPut
            ? item.market.spotUnderlyingToShort.raw.toString()
            : scaleUp(item.market.spotUnderlyingToShort.raw.toString())
        )
  }, [orderType, entity.isPut, item.market, scaleUp, scaleDown])

  const [prem, setPrem] = useState(getSpotPremiums())

  useEffect(() => {
    setPrem(getSpotPremiums())
  }, [orderType])

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
  // cost state
  const [cost, setCost] = useState({
    debit: '0',
    credit: '0',
    short: '0',
  })

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
          +item.entity.strikePrice > 5 ? '$0' : '$0.00'
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
        text: `Trade ${numeral(item.entity.strikePrice).format(
          +item.entity.strikePrice > 5 ? '$0' : '$0.00'
        )} ${item.entity.isCall ? 'Call' : 'Put'} ${formatExpiry(
          item.entity.expiryValue
        ).utc.substr(4, 12)}`,
        tip: 'Purchase tokenized, written covered options',
      }
      tokenAddress = entity.underlying.address
      balance = entity.underlying
      break
    case Operation.CLOSE_LONG:
      title = {
        text: `Trade ${numeral(item.entity.strikePrice).format(
          +item.entity.strikePrice > 5 ? '$0' : '$0.00'
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
  const tokenBalance = useTokenBalance(entity.address)
  const underlyingBalance = entity.isWethCall
    ? useBalance()
    : useTokenBalance(entity.underlying.address)
  const redeemBalance = useTokenBalance(entity.redeem.address)
  const optionToken = new Token(entity.chainId, entity.address, 18, 'LONG')
  const tokenAmount: TokenAmount = new TokenAmount(
    optionToken,
    parseEther(tokenBalance).toString()
  )

  const scaledOptionAmount: TokenAmount = new TokenAmount(
    tokenAmount.token,
    BigNumber.from(tokenAmount.raw.toString())
      .mul(
        entity.isPut
          ? entity.quoteValue.raw.toString()
          : entity.baseValue.raw.toString()
      )
      .div(entity.baseValue.raw.toString())
      .toString()
  )

  const shortToken = new Token(
    entity.chainId,
    entity.redeem.address,
    18,
    'SHORT'
  )
  const shortTokenAmount: TokenAmount = new TokenAmount(
    shortToken,
    parseEther(redeemBalance).toString()
  )

  const scaledShortToken: TokenAmount = new TokenAmount(
    shortTokenAmount.token,
    BigNumber.from(shortTokenAmount.raw.toString())
      .mul(
        entity.isPut
          ? entity.baseValue.raw.toString()
          : entity.quoteValue.raw.toString()
      )
      .div(entity.baseValue.raw.toString())
      .toString()
  )

  // if a short or close short order is submitted, use the router to swap between short<>underlying
  // else, use the connector contract to buy, write, and sell long option tokens.
  const spender =
    orderType === Operation.CLOSE_SHORT || orderType === Operation.SHORT
      ? SUSHI_ROUTER_ADDRESS[chainId]
      : PRIMITIVE_ROUTER[chainId].address

  const onApprove = useApprove()
  const handlePermit = usePermit()
  const handleDAIPermit = useDAIPermit()
  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(value)
    },
    [onUserInput]
  )

  const handleSetMax = useCallback(() => {
    if (orderType === Operation.LONG && !parseEther(prem).isZero()) {
      const maxOptions = parseEther(underlyingBalance)
        .mul(parseEther('1'))
        .div(parseEther((+prem * 1.5).toString()))
        .mul(parseEther('1'))
        .div(getPutMultiplier())
      onUserInput(parseFloat(formatEther(maxOptions)).toPrecision(12))
    } else if (
      orderType === Operation.CLOSE_LONG &&
      !parseEther(prem).isZero()
    ) {
      onUserInput(formatEther(scaledOptionAmount.raw.toString()))
    } else if (orderType === Operation.SHORT && !parseEther(prem).isZero()) {
      onUserInput(underlyingBalance)
    } else if (
      orderType === Operation.CLOSE_SHORT &&
      !parseEther(prem).isZero()
    ) {
      onUserInput(formatEther(scaledShortToken.raw.toString()))
    }
  }, [tokenBalance, onUserInput, prem, underlyingBalance, orderType])

  const getScaledAmount = useCallback(() => {
    const orderSize = entity.isPut
      ? orderType === Operation.CLOSE_SHORT || orderType === Operation.SHORT
        ? parsedAmount
        : scaleDown(parsedAmount)
      : parsedAmount
    return orderSize
  }, [orderType, entity.isPut, parsedAmount, scaleDown])

  const handleSubmitClick = useCallback(() => {
    // If the order type is close short, the short tokens will be scaled.
    // If the option is a put, scale the inputs up.
    const orderSize = getScaledAmount()
    submitOrder(library, BigInt(orderSize), orderType, BigInt('0'), signData)
  }, [
    submitOrder,
    item,
    library,
    parsedAmount,
    orderType,
    entity.isPut,
    signData,
  ])

  useEffect(() => {
    if (shortTokenAmount.greaterThan('0') && orderType === Operation.LONG) {
      updateItem(item, Operation.CLOSE_SHORT)
    }
    const calculateTotalCost = async () => {
      let debit = '0'
      let credit = '0'
      let short = '0'
      const size = entity.isPut ? scaleDown(parsedAmount) : parsedAmount
      let actualPremium: TokenAmount
      let spot: TokenAmount
      let slip
      try {
        if (parsedAmount.gt(BigNumber.from(0))) {
          ;[spot, actualPremium, slip] = item.market.getExecutionPrice(
            orderType,
            size
          )

          setImpact(slip)
          setPrem(formatEther(spot.raw.toString()))
        }
        if (orderType === Operation.LONG) {
          if (parsedAmount.gt(BigNumber.from(0))) {
            debit = formatEther(actualPremium.raw.toString())
          } else {
            setImpact('0.00')
            setPrem(formatEther(item.market.spotOpenPremium.raw.toString()))
          }
          // sell long, Trade.getClosePremium
        } else if (orderType === Operation.CLOSE_LONG) {
          if (parsedAmount.gt(BigNumber.from(0))) {
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
              entity.isPut ? parsedAmount : scaleUp(parsedAmount)
            )
            setImpact(slip)
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
              parsedAmount
            )
            short = formatEther(actualPremium.raw.toString())
            setImpact(slip)
            setPrem(formatEther(spot.raw.toString()))
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
  }, [
    item,
    parsedAmount,
    inputLoading,
    item.market,
    typedValue,
    orderType,
    entity.isPut,
  ])

  const getExecutionPrice = useCallback(() => {
    // the parsed total premium cost in underlying tokens divided by order quantity
    const long = formatEther(
      parseEther(cost.debit).mul(parseEther('1')).div(parsedAmount)
    )
    // the parsed total premium paid in underlying tokens divided by order quantity
    const credit = formatEther(
      parseEther(cost.credit).mul(parseEther('1')).div(parsedAmount)
    )

    // the total cost to swap short tokens to underlying tokens
    const short = cost.short

    // if options are being bought, display the price per long
    // if short options are being closed, display the underlying received per short
    // else, options are being written, so show the premium paid per option written
    return orderType === Operation.LONG
      ? long
      : orderType === Operation.CLOSE_SHORT || orderType === Operation.SHORT
      ? short
      : credit
  }, [item, parsedAmount, cost, orderType, entity.isPut])

  // return a bool after comparing the impact with 30% slippage.
  const isBelowSlippage = useCallback(() => {
    return impact !== 'NaN' ? Math.abs(parseFloat(impact)) < 30 : true
  }, [impact, slippage])

  const isApproved = useCallback(() => {
    if (item.entity.isWethCall && orderType !== Operation.CLOSE_LONG) {
      return true
    } else if (item.entity.isCall) {
      return approved[0]
    } else {
      return approved[0] || signData
    }
  }, [approved, item.entity, signData])

  // executes an approval transaction for the `tokenAddress` and `spender`, both dynamic vars.
  const handleApproval = useCallback(
    (amount: string) => {
      if (item.entity.isCall || orderType === Operation.CLOSE_LONG) {
        // call approval
        onApprove(tokenAddress, spender, amount)
          .then()
          .catch((error) => {
            addNotif(
              0,
              `Approving ${item.asset.toUpperCase()}`,
              error.message,
              ''
            )
          })
      } else if (item.entity.isWethCall) {
        // no approval
        return
      } else if (item.entity.isPut) {
        // puts use dai as underlying
        handleDAIPermit(spender)
          .then((data) => {
            setSignData(data)
          })
          .catch((error) => {
            addNotif(
              0,
              `Approving ${item.asset.toUpperCase()}`,
              error.message,
              ''
            )
          })
      } else {
        // else, use openFlashLongWithPermit for the underlying
        handlePermit(entity.underlying.address, spender, amount)
          .then((data) => {
            setSignData(data)
          })
          .catch((error) => {
            addNotif(
              0,
              `Approving ${item.asset.toUpperCase()}`,
              error.message,
              ''
            )
          })
      }
    },
    [
      item,
      onApprove,
      tokenAddress,
      spender,
      setSignData,
      handlePermit,
      handleDAIPermit,
    ]
  )

  const handleSecondaryApproval = useCallback(
    (amount: string) => {
      onApprove(secondaryAddress, spender, amount)
        .then()
        .catch((error) => {
          addNotif(
            0,
            `Approving ${item.asset.toUpperCase()}`,
            error.message,
            ''
          )
        })
    },
    [item, onApprove, secondaryAddress, spender]
  )

  const removeItem = useRemoveItem()

  // gets a value to multiply `put` underlying tokens by to get a scaled amount
  const getPutMultiplier = useCallback(() => {
    const multiplier = entity.isPut
      ? BigNumber.from(entity.baseValue.raw.toString())
      : parseEther('1')
    return multiplier
  }, [item, entity.isPut, parsedAmount])

  // either the underlying asset for calls, or DAI for puts
  const underlyingAssetSymbol = useCallback(() => {
    const symbol = entity.isPut ? 'DAI' : item.asset.toUpperCase()
    return symbol
  }, [item])

  // Check the token outflows against the token balances and return true or false
  const getHasEnoughForTrade = useCallback(() => {
    if (parsedAmount && underlyingBalance) {
      // The total cost of the order
      const totalCost = parseEther(cost.debit)
      if (orderType === Operation.LONG) {
        // if the total cost of the order is greater than the underlying token balance, premium cant be paid.
        return !totalCost.gt(parseEther(underlyingBalance))
      } else if (orderType === Operation.SHORT) {
        // the amount of options requesting to be written
        return !parseEther(cost.short).gt(parseEther(underlyingBalance))
      } else if (orderType === Operation.CLOSE_LONG) {
        // the order size when closing long options
        const totalLongSold = entity.isPut
          ? scaleDown(parsedAmount)
          : parsedAmount
        // if the close size is greater than the amount of long options held in the wallet
        return !totalLongSold.gt(parseEther(tokenBalance))
      } else if (orderType === Operation.CLOSE_SHORT) {
        // the close size of closing short tokens
        const totalShortSold = entity.isPut
          ? parsedAmount
          : scaleDown(parsedAmount)
        // if the close size exceeds the wallet balance of short option tokens
        return !totalShortSold.gt(parseEther(redeemBalance))
      }
    } else {
      return true
    }
  }, [
    entity,
    parsedAmount,
    underlyingBalance,
    tokenBalance,
    orderType,
    cost,
    scaleDown,
    scaleUp,
  ])

  return (
    <>
      <Box column alignItems="center">
        <CardHeader title={title} onClick={() => removeItem()} />
        <Switch
          disabled={loading}
          active={
            orderType !== Operation.CLOSE_LONG && orderType !== Operation.SHORT
          }
          onClick={() => {
            if (
              orderType === Operation.CLOSE_LONG ||
              orderType === Operation.SHORT
            ) {
              if (shortTokenAmount.greaterThan('0')) {
                updateItem(item, Operation.CLOSE_SHORT)
              } else {
                updateItem(item, Operation.LONG)
              }
            } else {
              if (tokenAmount.greaterThan('0')) {
                updateItem(item, Operation.CLOSE_LONG)
              } else {
                updateItem(item, Operation.SHORT)
              }
            }
          }}
        />

        {hasLiquidity ? null : (
          <>
            <Spacer size="sm" />
            <WarningTooltip>
              There is no liquidity in this option!
            </WarningTooltip>
          </>
        )}

        <Spacer size="sm" />
        <PriceInput
          title="Quantity"
          name="primary"
          onChange={handleTypeInput}
          quantity={typedValue}
          onClick={handleSetMax}
          balance={
            orderType === Operation.LONG
              ? null
              : orderType === Operation.SHORT
              ? null
              : scaledOptionAmount
          }
        />
        <Spacer size="sm" />
        <Spacer size="sm" />
        <Title full>Order Summary</Title>

        {inputLoading && hasLiquidity ? (
          <>
            <Loader />
            <Spacer />
          </>
        ) : (
          <>
            {parsedAmount.gt(0) && !error ? (
              <>
                {entity.isPut ? (
                  <LineItem
                    label={'Put Multiplier'}
                    data={formatEther(entity.baseValue.raw.toString())}
                    units={'x'}
                    tip="Each put token gives you the right to buy 1 dai. There is a multiplier to get the full strike price of put power."
                  />
                ) : (
                  <> </>
                )}
                <LineItem
                  label={'Execution Price'}
                  data={getExecutionPrice()}
                  units={underlyingAssetSymbol()}
                  color={isBelowSlippage() ? null : 'red'}
                  tip="The estimated price of the option after slippage."
                />
                <LineItem
                  label={'Price Impact'}
                  data={`${Math.abs(parseFloat(impact)).toString()}`}
                  units="%"
                  color={isBelowSlippage() ? null : 'red'}
                  tip="The % change in the price paid."
                />
              </>
            ) : (
              <>
                <LineItem
                  label={'Spot Price'}
                  data={formatBalance(prem)}
                  units={underlyingAssetSymbol()}
                  color={null}
                  tip="The current spot price of the option."
                />
                <Spacer size="sm" />
              </>
            )}
          </>
        )}
        {parsedAmount.gt(0) && !error ? (
          <>
            <Spacer size="sm" />
            <Separator />
            <Spacer size="sm" />
            <Description>
              <PurchaseInfo>
                <OptionTextInfo
                  orderType={orderType}
                  parsedAmount={getScaledAmount()}
                  isPut={entity.isPut}
                  strike={entity.quoteValue}
                  underlying={entity.baseValue}
                  debit={
                    new TokenAmount(
                      entity.underlying,
                      parseEther(cost.debit).toString()
                    )
                  }
                  credit={
                    new TokenAmount(
                      entity.underlying,
                      parseEther(cost.credit).toString()
                    )
                  }
                  short={
                    new TokenAmount(
                      entity.underlying,
                      parseEther(cost.short).toString()
                    )
                  }
                />
              </PurchaseInfo>
            </Description>
            <Spacer />
          </>
        ) : null}
        <Spacer size="sm" />
        {error ? (
          <Description>
            <WarningLabel>Order quantity too large!</WarningLabel>
            <Spacer size="sm" />
          </Description>
        ) : null}
        <StyledEnd row justifyContent="flex-start">
          {loading ? (
            <div style={{ width: '100%' }}>
              <Button
                disabled={loading}
                full
                variant="secondary"
                size="sm"
                onClick={() => {}}
                isLoading={loading}
                text=""
              />
            </div>
          ) : (
            <>
              {orderType === Operation.SHORT ? (
                <>
                  {isApproved() ? (
                    <Button
                      disabled={
                        !isApproved() ||
                        !parsedAmount?.gt(0) ||
                        error ||
                        !hasLiquidity ||
                        !isBelowSlippage() ||
                        !getHasEnoughForTrade()
                      }
                      full
                      size="sm"
                      onClick={handleSubmitClick}
                      isLoading={loading}
                      text={
                        !isBelowSlippage() && typedValue !== ''
                          ? 'Price Impact Too High'
                          : getHasEnoughForTrade()
                          ? 'Confirm Trade'
                          : 'Insufficient Balance'
                      }
                    />
                  ) : (
                    <>
                      <Button
                        disabled={parsedAmount.isZero()}
                        full
                        size="sm"
                        onClick={() =>
                          handleApproval(formatEther(getScaledAmount()))
                        }
                        isLoading={loading}
                        text="Approve Tokens"
                      />
                    </>
                  )}
                </>
              ) : (
                <>
                  {isApproved() ? (
                    <></>
                  ) : (
                    <>
                      <Button
                        disabled={parsedAmount.isZero()}
                        full
                        size="sm"
                        onClick={() =>
                          handleApproval(formatEther(getScaledAmount()))
                        }
                        isLoading={loading}
                        text="Approve Tokens"
                      />
                    </>
                  )}
                  <Button
                    disabled={
                      !isApproved() ||
                      !parsedAmount?.gt(0) ||
                      error ||
                      !hasLiquidity ||
                      !isBelowSlippage() ||
                      !getHasEnoughForTrade()
                    }
                    full
                    size="sm"
                    onClick={handleSubmitClick}
                    isLoading={loading}
                    text={
                      !isBelowSlippage() && typedValue !== ''
                        ? 'Price Impact Too High'
                        : getHasEnoughForTrade()
                        ? 'Confirm Trade'
                        : 'Insufficient Balance'
                    }
                  />
                </>
              )}
            </>
          )}
        </StyledEnd>
      </Box>
    </>
  )
}
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

const StyledInnerTitle = styled.div`
  color: ${(props) => props.theme.color.white};
  font-size: 24px;
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

export default Swap
