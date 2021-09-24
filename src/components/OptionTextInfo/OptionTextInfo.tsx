import React, { useCallback } from 'react'
import styled from 'styled-components'
import numeral from 'numeral'
import { parseEther, formatEther } from 'ethers/lib/utils'
import { BigNumber, BigNumberish } from 'ethers'

import { Operation } from '@primitivefi/sdk'
import { TokenAmount } from '@sushiswap/sdk'

const formatParsedAmount = (amount: BigNumberish) => {
  const bigAmt = BigNumber.from(amount)
  return numeral(formatEther(bigAmt)).format(
    bigAmt.lt(parseEther('0.01'))
      ? '0.0000'
      : bigAmt.gt(parseEther('1000'))
      ? '0'
      : '0.00'
  )
}

export interface OptionTextInfoProps {
  orderType?: Operation
  parsedAmount?: BigNumber
  isPut?: boolean
  strike?: TokenAmount
  underlying?: TokenAmount
  debit?: TokenAmount
  credit?: TokenAmount
  short?: TokenAmount
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
      case Operation.CLOSE_LONG:
        return 'SELL'
      case Operation.CLOSE_SHORT:
        return 'SELL'
      default:
        return 'SELL'
    }
  }, [orderType])

  const calculateProportionalShort = useCallback(() => {
    if (isPut) {
      return parsedAmount.mul(parseEther('1')).div(underlying.raw.toString())
    }
    return parsedAmount.mul(strike.raw.toString()).div(parseEther('1'))
  }, [parsedAmount, orderType, strike, isPut])

  return (
    <StyledSpan>
      You will <StyledData>close</StyledData>{' '}
      <StyledData>
        {' '}
        {orderType === Operation.SHORT || orderType === Operation.CLOSE_SHORT
          ? formatParsedAmount(
              isPut
                ? parsedAmount
                : parsedAmount.mul(parseEther('1')).div(strike.raw.toString())
            )
          : formatParsedAmount(
              parsedAmount.mul(parseEther('1')).div(underlying.raw.toString())
            )}{' '}
        {orderType === Operation.SHORT || orderType === Operation.CLOSE_SHORT
          ? 'SHORT'
          : ''}{' '}
        {isPut ? 'PUT' : 'CALL'}{' '}
      </StyledData>
      {orderType === Operation.SHORT ? (
        <>
          for{' '}
          <StyledData>
            {formatParsedAmount(
              isPut ? short.raw.toString() : short.raw.toString()
            )}{' '}
            {short.token.symbol === 'WETH' ? 'ETH' : short.token.symbol}
          </StyledData>{' '}
          in premium.{' '}
        </>
      ) : orderType === Operation.CLOSE_LONG ? (
        <>
          for{' '}
          <StyledData>
            {formatParsedAmount(credit.raw.toString())}{' '}
            {credit.token.symbol === 'WETH' ? 'ETH' : credit.token.symbol}
          </StyledData>{' '}
          in premium.{' '}
        </>
      ) : orderType === Operation.CLOSE_SHORT ? (
        <>
          for{' '}
          <StyledData>
            {formatParsedAmount(short.raw.toString())}{' '}
            {short.token.symbol === 'WETH' ? 'ETH' : short.token.symbol}
          </StyledData>{' '}
          .{' '}
        </>
      ) : orderType === Operation.LONG ? (
        isPut ? (
          <>
            for{' '}
            <StyledData>
              {formatParsedAmount(debit.raw.toString())}{' '}
              {debit.token.symbol === 'WETH' ? 'ETH' : debit.token.symbol}
            </StyledData>{' '}
            which gives you the right to sell{' '}
            <StyledData>
              {formatParsedAmount(calculateProportionalShort())}{' '}
              {strike.token.symbol}
            </StyledData>{' '}
            for{' '}
            <StyledData>
              {formatParsedAmount(parsedAmount)} {underlying.token.symbol}
            </StyledData>
            .{' '}
          </>
        ) : (
          <>
            for{' '}
            <StyledData>
              {formatParsedAmount(debit.raw.toString())}{' '}
              {debit.token.symbol === 'WETH' ? 'ETH' : debit.token.symbol}
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
        )
      ) : (
        <>
          which gives you the right to purchase{' '}
          <StyledData>
            {underlying.raw.toString()} {underlying.token.symbol}
          </StyledData>{' '}
          for{' '}
          <StyledData>
            {formatParsedAmount(parseEther('1').div(strike.raw.toString()))}{' '}
            {strike.token.symbol}
          </StyledData>
          .{' '}
        </>
      )}
    </StyledSpan>
  )
}

const StyledSpan = styled.span`
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 15px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.04em;
`

const StyledData = styled.span`
  color: ${(props) => props.theme.color.white};
  font-size: 16px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0px;
`

export default OptionTextInfo
