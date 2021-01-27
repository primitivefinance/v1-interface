import React, { useCallback } from 'react'
import styled from 'styled-components'
import numeral from 'numeral'
import { parseEther, formatEther } from 'ethers/lib/utils'
import { BigNumber, BigNumberish } from 'ethers'

import { Operation } from '@primitivefi/sdk'
import { TokenAmount } from '@uniswap/sdk'

const formatParsedAmount = (amount: BigNumberish) => {
  const bigAmt = BigNumber.from(amount)
  return numeral(formatEther(bigAmt)).format(
    bigAmt.lt(parseEther('0.01')) ? '0.0000' : '0.00'
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

const StyledSpan = styled.span`
  color: ${(props) => props.theme.color.grey[400]};
`

const StyledData = styled.span`
  color: ${(props) => props.theme.color.white};
  font-size: 16px;
  font-weight: 500;
  text-transform: uppercase;
`

export default OptionTextInfo
