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
  // toggle for advanced info
  const [advanced, setAdvanced] = useState(false)
  // approval state
  const { item, orderType, loading, approved } = useItem()
  // cost state
  const [cost, setCost] = useState({
    debit: '0',
    credit: '0',
    short: '0',
  })
  const [prem, setPrem] = useState(
    orderType === Operation.CLOSE_LONG || orderType === Operation.LONG
      ? formatEther(item.premium)
      : formatEther(item.shortPremium)
  )
  const [impact, setImpact] = useState('0.00')
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
  const isPut = item.entity.isPut
  const underlyingToken: Token = new Token(
    entity.chainId,
    entity.assetAddresses[0],
    18,
    isPut ? 'DAI' : item.asset.toUpperCase()
  )
  const shortToken = new Token(
    entity.chainId,
    entity.assetAddresses[2],
    18,
    'SHORT'
  )
  const lpPair = useReserves(underlyingToken, shortToken).data
  // has liquidity?
  useEffect(() => {
    if (lpPair) {
      setHasL(lpPair.reserveOf(shortToken).numerator[2])
    }
  }, [setHasL, lpPair])

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

  useEffect(() => {
    const calculateTotalCost = async () => {
      let debit = '0'
      let credit = '0'
      let short = '0'
      let size = parsedAmount
      const base = item.entity.base.quantity.toString()
      const quote = item.entity.quote.quantity.toString()
      size = item.entity.isCall ? size : size.mul(quote).div(base)
      let minPayout = ''
      // buy long
      if (orderType === Operation.LONG) {
        if (parsedAmount.gt(BigNumber.from(0))) {
          minPayout = Trade.getAmountsInPure(
            size,
            [item.entity.assetAddresses[2], item.entity.assetAddresses[0]],
            item.reserves[1],
            item.reserves[0]
          )[0].toString()
          setImpact(
            (
              parseInt(parseEther(minPayout).toString()) /
              parseInt(parseEther(item.reserves[0].toString()).toString())
            ).toString()
          )
          setPrem(formatEther(minPayout))
          debit = premiumMulSize(minPayout, size)
        } else {
          setImpact('0.00')
          setPrem(formatEther(item.premium))
        }
        // sell long
      } else if (orderType === Operation.CLOSE_LONG) {
        if (parsedAmount.gt(BigNumber.from(0))) {
          minPayout = Trade.getClosePremium(
            size,
            base,
            quote,
            [item.entity.assetAddresses[2], item.entity.assetAddresses[0]],
            [item.reserves[1], item.reserves[0]]
          ).toString()
          setImpact(
            (
              parseInt(parseEther(minPayout).toString()) /
              parseInt(parseEther(item.reserves[0].toString()).toString())
            ).toString()
          )
          setPrem(formatEther(minPayout))
          credit = premiumMulSize(minPayout, size)
        } else {
          setImpact('0.00')
          setPrem(formatEther(item.premium))
        }
        // buy short && sell short
      } else if (
        orderType === Operation.SHORT ||
        orderType === Operation.CLOSE_SHORT
      ) {
        if (parsedAmount.gt(BigNumber.from(0))) {
          minPayout = Trade.getAmountsInPure(
            size,
            [item.entity.assetAddresses[2], item.entity.assetAddresses[0]],
            item.reserves[1],
            item.reserves[0]
          )[0].toString()
          setImpact(
            (
              parseInt(parseEther(minPayout).toString()) /
              parseInt(parseEther(item.reserves[0].toString()).toString())
            ).toString()
          )
          setPrem(formatEther(minPayout))
          short = premiumMulSize(minPayout, size)
        } else {
          setImpact('0.00')
          setPrem(formatEther(item.premium))
        }
      }
      swapLoaded()
      setCost({ debit, credit, short })
    }
    if (lpPair && inputLoading) {
      calculateTotalCost()
    }
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
        <LineItem label="Price Impact" data={`${impact}`} units="%" />
      )}
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
                  {formatBalance(cost.credit)}{' '}
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
        </>
      ) : (
        <> </>
      )}
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
`

const StyledData = styled.span`
  color: ${(props) => props.theme.color.white};
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
`
export default Swap
