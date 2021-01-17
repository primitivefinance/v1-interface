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
import Title from '@/components/Title'
import ClearIcon from '@material-ui/icons/Clear'
import { Operation, UNISWAP_CONNECTOR } from '@/constants/index'

import { BigNumber, BigNumberish, ethers } from 'ethers'
import { parseEther, formatEther, parseUnits } from 'ethers/lib/utils'

import useGuardCap from '@/hooks/transactions/useGuardCap'
import useApprove from '@/hooks/transactions/useApprove'
import useTokenBalance from '@/hooks/useTokenBalance'
import { useSlippage } from '@/state/user/hooks'

import { UNI_ROUTER_ADDRESS, ADDRESS_ZERO } from '@primitivefi/sdk'

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

interface SwitchProps {
  active: boolean
  onClick: () => void
}

const Switch: React.FC<SwitchProps> = ({ active, onClick }) => {
  return (
    <StyledToggleContainer>
      <StyledFilterBarInner>
        <Toggle full>
          <ToggleButton active={active} onClick={onClick} text="Buy" />
          <ToggleButton active={!active} onClick={onClick} text="Sell" />
        </Toggle>
      </StyledFilterBarInner>
    </StyledToggleContainer>
  )
}

interface TitleType {
  tip: string
  text: string
}

interface CardHeaderProps {
  title: TitleType
  onClick: () => void
}

const CardHeader: React.FC<CardHeaderProps> = ({ title, onClick }) => {
  return (
    <Title full>
      <Tooltip text={title.tip}>{title.text}</Tooltip>
      <CustomButton>
        <Button variant="transparent" size="sm" onClick={onClick}>
          <ClearIcon />
        </Button>
      </CustomButton>
    </Title>
  )
}

interface OptionTextInfoProps {
  orderType?: Operation
  parsedAmount?: BigNumber
  isPut?: boolean
  strike?: TokenAmount
  underlying?: TokenAmount
  debit?: TokenAmount
  credit?: TokenAmount
  short?: TokenAmount
}

const formatParsedAmount = (amount: BigNumberish) => {
  const bigAmt = ethers.BigNumber.from(amount)
  return numeral(formatEther(bigAmt)).format(
    bigAmt.lt(parseEther('0.01')) ? '0.0000' : '0.00'
  )
}

const OptionTextInfo: React.FC<OptionTextInfoProps> = ({
  orderType,
  parsedAmount,
  isPut,
  strike,
  underlying,
  debit,
  credit,
  short,
}) => {
  const getOrderTitle = useCallback(() => {
    switch (orderType) {
      case Operation.LONG:
        return 'BUY'
      case Operation.SHORT:
        return 'BUY'
      case Operation.WRITE:
        return 'SELL TO OPEN'
      default:
        return 'SELL'
    }
  }, [orderType])

  const calculateProportionalShort = useCallback(() => {
    return parsedAmount.mul(strike.raw.toString()).div(parseEther('1'))
  }, [parsedAmount, orderType, strike])

  return (
    <StyledSpan>
      You will <StyledData>{getOrderTitle()}</StyledData>{' '}
      <StyledData>
        {' '}
        {formatParsedAmount(parsedAmount)}{' '}
        {orderType === Operation.SHORT || orderType === Operation.CLOSE_SHORT
          ? 'SHORT'
          : ''}{' '}
        {isPut ? 'PUT' : 'CALL'}{' '}
      </StyledData>
      {orderType === Operation.CLOSE_LONG || orderType === Operation.WRITE ? (
        <>
          for{' '}
          <StyledData>
            {formatParsedAmount(credit.raw.toString())} {credit.token.symbol}
          </StyledData>
          .{' '}
        </>
      ) : orderType === Operation.CLOSE_SHORT ? (
        <>
          for{' '}
          <StyledData>
            {formatParsedAmount(short.raw.toString())} {short.token.symbol}
          </StyledData>
          .{' '}
        </>
      ) : orderType === Operation.SHORT ? (
        <>
          for{' '}
          <StyledData>
            {' '}
            {formatParsedAmount(short.raw.toString())} {short.token.symbol}
          </StyledData>{' '}
          which gives you the right to withdraw{' '}
          <StyledData>
            {formatParsedAmount(
              parsedAmount.mul(strike.raw.toString()).div(parseEther('1'))
            )}{' '}
            {underlying.token.symbol}
          </StyledData>{' '}
          when the options expire unexercised, or the right to redeem them for{' '}
          <StyledData>
            {' '}
            {formatParsedAmount(parsedAmount)} {strike.token.symbol}
          </StyledData>{' '}
          if they are exercised.{' '}
        </>
      ) : orderType === Operation.LONG ? (
        <>
          for{' '}
          <StyledData>
            {formatParsedAmount(debit.raw.toString())} {debit.token.symbol}
          </StyledData>{' '}
          which gives you the right to purchase{' '}
          <StyledData>
            {formatParsedAmount(parsedAmount)} {underlying.token.symbol}
          </StyledData>{' '}
          for{' '}
          <StyledData>
            {formatParsedAmount(calculateProportionalShort())}{' '}
            {strike.token.symbol}
          </StyledData>
          .{' '}
        </>
      ) : (
        <>
          which gives you the right to purchase{' '}
          <StyledData>
            {underlying.raw.toString()} {underlying.token.symbol}
          </StyledData>{' '}
          for{' '}
          <StyledData>
            {isPut ? +strike.raw.toString() : +strike.raw.toString()}{' '}
            {strike.token.symbol}
          </StyledData>
          .{' '}
        </>
      )}
    </StyledSpan>
  )
}

const EMPTY_TOKEN_AMOUNT = (chainId) => {
  return new TokenAmount(new Token(chainId, ADDRESS_ZERO, 18), '0')
}

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
            /* ;[spot, actualPremium, slip] = item.market.getExecutionPrice(
              orderType,
              size
            )
            setImpact(slip)
            setPrem(formatEther(spot.raw.toString())) */
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
            /* ;[spot, actualPremium, slip] = item.market.getExecutionPrice(
              orderType,
              size
            )
            setImpact(slip)
            setPrem(
              formatEther(item.market.spotUnderlyingToShort.raw.toString())
            ) */
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
            /* ;[spot, actualPremium, slip] = item.market.getExecutionPrice(
              orderType,
              size
            )
            setImpact(slip)
            setPrem(
              formatEther(item.market.spotUnderlyingToShort.raw.toString())
            ) */
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
        <Spacer size="sm" />

        <Switch active={active} onClick={handleToggleClick} />

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
        />
        <Spacer />
        <Title full>Order Summary</Title>
        {!inputLoading ? (
          <>
            <LineItem
              label="Price"
              data={formatBalance(prem)}
              units={underlyingAssetSymbol()}
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
const CustomButton = styled.div`
  margin-top: -0.1em;
  background: none;
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
