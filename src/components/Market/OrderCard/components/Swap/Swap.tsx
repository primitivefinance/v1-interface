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
import { Operation, UNISWAP_CONNECTOR } from '@/constants/index'

import { BigNumber, BigNumberish, ethers } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'

import useApprove from '@/hooks/transactions/useApprove'
import useTokenBalance from '@/hooks/useTokenBalance'
import { useSlippage } from '@/state/user/hooks'

import {
  UNI_ROUTER_ADDRESS,
  ADDRESS_ZERO,
  Venue,
  SUSHI_ROUTER_ADDRESS,
  SUSHISWAP_CONNECTOR,
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
import { Token, TokenAmount } from '@uniswap/sdk'
import formatEtherBalance from '@/utils/formatEtherBalance'
import numeral from 'numeral'
import { tryParseAmount } from '@/utils/tryParseAmount'
const formatParsedAmount = (amount: BigNumberish) => {
  const bigAmt = BigNumber.from(amount)
  return numeral(formatEther(bigAmt)).format(
    bigAmt.lt(parseEther('0.01')) ? '0.0000' : '0.00'
  )
}

const Swap: React.FC = () => {
  //state
  const [description, setDescription] = useState(false)
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  // approval state
  const { item, orderType, loading, approved } = useItem()

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
  // cost state
  const [cost, setCost] = useState({
    debit: '0',
    credit: '0',
    short: '0',
  })

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
  const tokenBalance = useTokenBalance(entity.address)
  const optionTokenAmount = new Token(
    entity.chainId,
    entity.address,
    18,
    'LONG'
  )
  const tokenAmount: TokenAmount = new TokenAmount(
    optionTokenAmount,
    parseEther(tokenBalance).toString()
  )

  const isUniswap = item.venue === Venue.UNISWAP ? true : false

  const spender =
    orderType === Operation.CLOSE_SHORT || orderType === Operation.SHORT
      ? isUniswap
        ? UNI_ROUTER_ADDRESS
        : SUSHI_ROUTER_ADDRESS
      : isUniswap
      ? UNISWAP_CONNECTOR[chainId]
      : SUSHISWAP_CONNECTOR[chainId]

  const underlyingTokenBalance = useTokenBalance(entity.underlying.address)
  const underlyingAmount: TokenAmount = new TokenAmount(
    entity.underlying,
    parseEther(underlyingTokenBalance).toString()
  )
  const onApprove = useApprove()

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(value)
    },
    [onUserInput]
  )

  const handleSetMax = useCallback(() => {
    if (orderType === Operation.LONG && !parseEther(prem).isZero()) {
      const maxOptions = parseEther(tokenBalance)
        .mul(parseEther('1'))
        .div(parseEther(prem))
      onUserInput(formatEther(maxOptions))
    } else if (
      orderType === Operation.CLOSE_LONG &&
      !parseEther(prem).isZero()
    ) {
      onUserInput(tokenBalance)
    }
  }, [tokenBalance, onUserInput, prem])

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
        } else if (
          orderType === Operation.CLOSE_LONG ||
          orderType === Operation.WRITE
        ) {
          if (parsedAmount.gt(BigNumber.from(0))) {
            credit = formatEther(actualPremium.raw.toString())
          } else {
            setImpact('0.00')
            setPrem(formatEther(item.market.spotClosePremium.raw.toString()))
          }
          // buy short swap from UNDER -> RDM
        } else if (orderType === Operation.SHORT) {
          if (parsedAmount.gt(BigNumber.from(0))) {
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
  }, [item, parsedAmount, inputLoading, item.market, typedValue, orderType])

  const calculateProportionalShort = useCallback(() => {
    const sizeWei = parsedAmount
    return formatEtherBalance(entity.proportionalShort(sizeWei))
  }, [item, parsedAmount])

  const isBelowSlippage = useCallback(() => {
    return impact !== 'NaN' ? Math.abs(parseFloat(impact)) < 30 : true
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

  const removeItem = useRemoveItem()

  const underlyingAssetSymbol = useCallback(() => {
    const symbol = entity.isPut ? 'DAI' : item.asset.toUpperCase()
    return symbol
  }, [item])

  return (
    <>
      <Box column alignItems="center">
        <CardHeader title={title} onClick={() => removeItem()} />
        <Separator />

        <Switch
          active={
            orderType !== Operation.CLOSE_LONG && orderType !== Operation.WRITE
          }
          onClick={() => {
            if (
              orderType === Operation.CLOSE_LONG ||
              orderType === Operation.WRITE
            ) {
              updateItem(item, Operation.LONG)
            } else {
              if (tokenAmount.greaterThan('0')) {
                updateItem(item, Operation.CLOSE_LONG)
              } else {
                updateItem(item, Operation.WRITE)
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
            orderType === Operation.LONG ? underlyingAmount : tokenAmount
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
                <LineItem
                  label={'Execution Price'}
                  data={
                    orderType === Operation.LONG
                      ? `${
                          parseFloat(
                            formatParsedAmount(
                              parseEther(cost.debit).toString()
                            ).toString()
                          ) /
                          parseFloat(
                            formatParsedAmount(
                              parsedAmount.toString()
                            ).toString()
                          )
                        }`
                      : `${
                          parseFloat(
                            formatParsedAmount(
                              parseEther(cost.credit).toString()
                            )
                          ) /
                          parseFloat(
                            formatParsedAmount(parsedAmount.toString())
                          )
                        }`
                  }
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
                  parsedAmount={parsedAmount}
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
                      disabled={!parsedAmount?.gt(0) || error || !hasLiquidity}
                      full
                      size="sm"
                      onClick={handleSubmitClick}
                      isLoading={loading}
                      text="Confirm Trade"
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
                    text={'Confirm Trade'}
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
