import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import LineItem from '@/components/LineItem'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'
import Tooltip from '@/components/Tooltip'
import { Operation, UNISWAP_CONNECTOR } from '@/constants/index'
import numeral from 'numeral'
import formatExpiry from '@/utils/formatExpiry'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'

import useApprove from '@/hooks/transactions/useApprove'
import useTokenAllowance from '@/hooks/useTokenAllowance'
import useTokenBalance from '@/hooks/useTokenBalance'
import useTokenTotalSupply from '@/hooks/useTokenTotalSupply'

import { Trade, Market } from '@primitivefi/sdk'
import { Fraction, Pair } from '@uniswap/sdk'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import isZero from '@/utils/isZero'
import Separator from '@/components/Separator'

import {
  useItem,
  useUpdateItem,
  useHandleSubmitOrder,
} from '@/state/order/hooks'

import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount } from '@uniswap/sdk'
import { useAddNotif } from '@/state/notifs/hooks'
import { tryParseAmount } from '@/utils/index'
import { useLiquidityActionHandlers, useLP } from '@/state/liquidity/hooks'

const AddLiquidity: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  // toggle for advanced info
  const [advanced, setAdvanced] = useState(false)
  // option entity in order
  const { item, orderType, approved, loading } = useItem()
  // inputs for user quantity
  const { optionValue, underlyingValue } = useLP()
  const { onOptionInput, onUnderInput } = useLiquidityActionHandlers()
  const parsedOptionAmount = tryParseAmount(optionValue)
  const parsedUnderlyingAmount = tryParseAmount(underlyingValue)
  // set null lp
  const [hasLiquidity, setHasL] = useState(false)
  const [tab, setTab] = useState(0)
  useEffect(() => {
    if (tab === 1) {
      updateItem(item, Operation.ADD_LIQUIDITY_CUSTOM)
    } else {
      updateItem(item, Operation.ADD_LIQUIDITY)
    }
  }, [tab])
  // web3
  const { library, chainId } = useWeb3React()
  // approval
  const addNotif = useAddNotif()
  // guard cap
  // const guardCap = useGuardCap(item.asset, orderType)
  // pair and option entities
  const entity = item.entity
  // has liquidity?
  useEffect(() => {
    if (item.market) {
      setHasL(item.market.hasLiquidity)
    }
  }, [setHasL, item])

  const lpToken = item.market ? item.market.liquidityToken.address : ''
  const token0 = item.market ? item.market.token0.symbol : ''
  const token1 = item.market ? item.market.token1.symbol : ''
  const underlyingTokenBalance = useTokenBalance(entity.underlying.address)
  const shortTokenBalance = useTokenBalance(entity.redeem.address)
  const lp = useTokenBalance(lpToken)
  const lpTotalSupply = useTokenTotalSupply(lpToken)
  const spender = UNISWAP_CONNECTOR[chainId]
  const tokenAllowance = useTokenAllowance(entity.underlying.address, spender)
  const onApprove = useApprove()

  const underlyingAmount: TokenAmount = new TokenAmount(
    entity.underlying,
    parseEther(underlyingTokenBalance).toString()
  )
  const shortAmount: TokenAmount = new TokenAmount(
    entity.redeem,
    parseEther(shortTokenBalance).toString()
  )

  const handleOptionInput = useCallback(
    (value: string) => {
      onOptionInput(value)
      if (value === '0.') {
        value = '0'
      }
      if (tab === 1) {
        onUnderInput(
          formatEther(
            Trade.getQuote(
              parseEther(value),
              item.market.reserveOf(entity.redeem).raw.toString(),
              item.market.reserveOf(entity.underlying).raw.toString()
            ).toString()
          )
        )
      }
    },
    [onOptionInput, onUnderInput, tab]
  )
  const handleUnderInput = useCallback(
    (value: string) => {
      onUnderInput(value)
      if (tab === 1) {
        onOptionInput(
          formatEther(
            Trade.getQuote(
              parseEther(value),
              item.market.reserveOf(entity.underlying).raw.toString(),
              item.market.reserveOf(entity.redeem).raw.toString()
            ).toString()
          )
        )
      }
    },
    [onUnderInput, onOptionInput, tab]
  )
  // FIX

  const handleSetMax = useCallback(() => {
    onUnderInput(underlyingTokenBalance)
  }, [underlyingTokenBalance, onUnderInput])

  const handleSubmitClick = useCallback(() => {
    if (tab !== 1 && hasLiquidity) {
      submitOrder(
        library,
        BigInt(parsedUnderlyingAmount.toString()),

        orderType,
        BigInt(parsedUnderlyingAmount.toString())
      )
    } else {
      submitOrder(
        library,
        BigInt(parsedOptionAmount.toString()),
        orderType,
        BigInt(parsedUnderlyingAmount.toString())
      )
    }
  }, [
    submitOrder,
    item,
    tab,
    library,
    parsedOptionAmount,
    parsedUnderlyingAmount,
    orderType,
  ])

  const calculateToken0PerToken1 = useCallback(() => {
    if (typeof item.market === 'undefined' || item.market === null) return '0'
    const ratio = item.market.token1Price.raw.toSignificant(2)
    return ratio
  }, [item.market])

  const calculateToken1PerToken0 = useCallback(() => {
    if (typeof item.market === 'undefined' || item.market === null) return '0'
    const ratio = item.market.token0Price.raw.toSignificant(2)
    return ratio
  }, [item.market])

  // the quantity of options supplied as liquidity for the 'pile-on' order type is not equal to the parsed amount input.
  // optionsAdded = totalUnderlyingTokensAdded (parsed amount sum) / (strikeRatio * reserveB / reserveA + 1)
  const calculateOptionsAddedAsLiquidity = useCallback(() => {
    const parsedAmount =
      tab !== 1 && hasLiquidity
        ? Trade.getQuote(
            parsedUnderlyingAmount,
            item.market.reserveOf(entity.underlying).raw.toString(),
            item.market.reserveOf(entity.redeem).raw.toString()
          )
        : parsedOptionAmount

    if (
      typeof item.market === 'undefined' ||
      item.market === null ||
      typeof parsedAmount === 'undefined' ||
      BigNumber.from(parseEther(lpTotalSupply)).isZero() ||
      BigNumber.from(parsedAmount).isZero()
    ) {
      return parsedAmount || '0'
    }
    const inputAmount = new TokenAmount(
      entity.underlying,
      parsedAmount.toString()
    )
    return item.market.getOptionsAddedAsLiquidity(inputAmount).raw.toString()
  }, [
    item.market,
    lp,
    lpTotalSupply,
    parsedOptionAmount,
    parsedUnderlyingAmount,
  ])

  const calculatePoolShare = useCallback(() => {
    const none = { addedPoolShare: '0', newPoolShare: '0' }
    const supply = parseEther(lpTotalSupply)
    const parsedAmount =
      tab === 1
        ? parsedOptionAmount
        : BigNumber.from(calculateOptionsAddedAsLiquidity())
    if (
      typeof item.market === 'undefined' ||
      item.market === null ||
      supply.isZero()
    )
      return none
    const tSupply = new TokenAmount(
      item.market.liquidityToken,
      parseEther(lpTotalSupply).toString()
    )
    const amountADesired = calculateOptionsAddedAsLiquidity().toString()
    const amountBDesired = Trade.getQuote(
      entity.proportionalShort(amountADesired),
      item.market.reserveOf(entity.redeem).raw.toString(),
      item.market.reserveOf(entity.underlying).raw.toString()
    ).toString()

    if (isZero(amountADesired) || isZero(amountBDesired)) {
      return none
    }
    const tokenAmountA = new TokenAmount(entity.underlying, amountADesired)
    const tokenAmountB = new TokenAmount(entity.redeem, amountBDesired)
    const lpHold = new TokenAmount(
      item.market.liquidityToken,
      parseEther(lp).toString()
    )
    const lpMinted = item.market.getLiquidityMinted(
      tSupply,
      tokenAmountA,
      tokenAmountB
    )
    const poolShare =
      supply.gt(0) && parsedAmount.gt(0)
        ? lpMinted.divide(tSupply.add(lpMinted))
        : new Fraction('0')

    const newPoolShare = poolShare
      .add(
        supply.gt(0) ? lpHold.divide(tSupply.add(lpMinted)) : new Fraction('0')
      )
      .multiply('100')
      .toSignificant(6)
    const addedPoolShare = poolShare.multiply('100').toSignificant(6)
    return { addedPoolShare, newPoolShare }
  }, [
    item.market,
    lp,
    lpTotalSupply,
    parsedOptionAmount,
    parsedUnderlyingAmount,
    calculateOptionsAddedAsLiquidity,
  ])

  const calculateLiquidityValuePerShare = useCallback(() => {
    if (
      typeof item.market === 'undefined' ||
      item.market === null ||
      BigNumber.from(parseEther(lpTotalSupply)).isZero()
    )
      return {
        shortPerLp: '0',
        underlyingPerLp: '0',
        totalUnderlyingPerLp: '0',
      }

    const [
      shortValue,
      underlyingValue,
      totalUnderlyingValue,
    ] = item.market.getLiquidityValuePerShare(
      new TokenAmount(
        item.market.liquidityToken,
        parseEther(lpTotalSupply).toString()
      )
    )
    const shortPerLp = formatEther(shortValue.raw.toString())
    const underlyingPerLp = formatEther(underlyingValue.raw.toString())
    const totalUnderlyingPerLp = formatEther(
      totalUnderlyingValue.raw.toString()
    )
    return { shortPerLp, underlyingPerLp, totalUnderlyingPerLp }
  }, [item.market, lp, lpTotalSupply])

  const calculateImpliedPrice = useCallback(() => {
    if (
      typeof item.market === 'undefined' ||
      item.market === null ||
      !hasLiquidity ||
      parsedOptionAmount !== undefined
    ) {
      // if the reserves will be set based on the inputs
      let inputShort
      if (orderType === Operation.ADD_LIQUIDITY) {
        inputShort = entity.proportionalShort(parsedOptionAmount)
      } else {
        inputShort = parsedOptionAmount // pair has short tokens, so need to convert our desired options to short options))
      }
      const redeemAmount = new TokenAmount(entity.redeem, inputShort)
      const underlyingAmount = new TokenAmount(
        entity.underlying,
        parsedUnderlyingAmount.toString()
      )
      const tempMarket = new Market(entity, redeemAmount, underlyingAmount)
      return formatEther(tempMarket.spotOpenPremium.raw.toString())
    }
    return formatEther(item.market.spotOpenPremium.raw.toString())
  }, [
    item.market,
    lp,
    lpTotalSupply,
    parsedOptionAmount,
    parsedUnderlyingAmount,
  ])

  /* const isAboveGuardCap = useCallback(() => {
    const inputValue = parsedUnderlyingAmount
    return inputValue ? inputValue.gt(guardCap) && chainId === 1 : false
  }, [parsedUnderlyingAmount, guardCap]) */

  const handleApproval = useCallback(() => {
    onApprove(entity.underlying.address, spender)
      .then()
      .catch((error) => {
        addNotif(
          0,
          `Approving ${entity.underlying.symbol.toUpperCase()}`,
          error.message,
          ''
        )
      })
  }, [entity.underlying, tokenAllowance, onApprove])

  const title = {
    text: `${numeral(item.entity.strikePrice).format(
      +item.entity.strikePrice > 1 ? '$0' : '$0.00'
    )} ${item.entity.isCall ? 'Call' : 'Put'} ${formatExpiry(
      item.entity.expiryValue
    ).utc.substr(4, 12)}`,
    tip:
      'Underlying tokens are used to mint short tokens, which are provided as liquidity to the pair, along with additional underlying tokens',
  }

  const noLiquidityTitle = {
    text:
      'This pair has no liquidity, adding liquidity will initialize this market and set an initial token ratio.',
    tip:
      'Providing liquidity to this pair will set the ratio between the tokens.',
  }

  return (
    <LiquidityContainer>
      <Spacer size="sm" />
      {hasLiquidity ? (
        <PriceInput
          name="primary"
          title={`Underlying`}
          quantity={underlyingValue}
          onChange={handleUnderInput}
          onClick={handleSetMax}
          balance={
            new TokenAmount(
              entity.underlying,
              parseEther(underlyingTokenBalance).toString()
            )
          }
          valid={parseEther(underlyingTokenBalance).gte(parsedUnderlyingAmount)}
        />
      ) : (
        <>
          <>
            <StyledSubtitle>
              {!loading ? noLiquidityTitle.text : null}
            </StyledSubtitle>
          </>
          <Spacer size="sm" />
          <PriceInput
            name="primary"
            title={`LONG Input`}
            quantity={optionValue}
            onChange={handleOptionInput}
            onClick={() => console.log('Max unavailable.')} //
          />
          <Spacer />
          <PriceInput
            name="secondary"
            title={`Underlying Input`}
            quantity={underlyingValue}
            onChange={handleUnderInput}
            onClick={() => console.log('Max unavailable.')} //
            balance={underlyingAmount}
          />
        </>
      )}
      <Spacer />
      <LineItem
        label="LP for"
        data={formatEther(calculateOptionsAddedAsLiquidity())}
        units={`LONG`}
      />
      <Spacer size="sm" />
      {!hasLiquidity || tab === 1 ? (
        <>
          <LineItem
            label="Implied Option Price"
            data={`${calculateImpliedPrice()}`}
            units={`${entity.underlying.symbol.toUpperCase()}`}
          />
          <Spacer size="sm" />{' '}
        </>
      ) : (
        <></>
      )}
      <LineItem
        label="Receive"
        data={!hasLiquidity ? '0.00' : calculatePoolShare().addedPoolShare}
        units={`% of Pool`}
      />

      <Spacer size="sm" />
      <Box row justifyContent="flex-start">
        {loading ? (
          <div style={{ width: '100%' }}>
            <Box column alignItems="center" justifyContent="center">
              <Button
                disabled={true}
                full
                size="sm"
                onClick={() => {}}
                text={`Confirm`}
              />
            </Box>
          </div>
        ) : (
          <>
            {approved[0] ? (
              <> </>
            ) : (
              <>
                <Button
                  full
                  size="sm"
                  onClick={handleApproval}
                  text={`Approve ${entity.underlying.symbol.toUpperCase()}`}
                />
              </>
            )}

            <Button
              disabled={
                !approved[0] ||
                !parsedUnderlyingAmount?.gt(0) ||
                (hasLiquidity ? null : !parsedOptionAmount?.gt(0)) ||
                (item.entity.isCall
                  ? parseFloat(underlyingValue) >= 1000
                  : parseFloat(underlyingValue) >= 100000)
              }
              full
              size="sm"
              onClick={handleSubmitClick}
              text={'Confirm'}
            />
          </>
        )}
      </Box>
    </LiquidityContainer>
  )
}

const LiquidityContainer = styled.div`
  width: 34em;
`

const StyledSubtitle = styled.div`
  color: yellow;
  display: table;
  align-items: center;
  justify-content: center;
  width: 100%;
  letter-spacing: 1px;
  text-transform: uppercase;

  font-size: 13px;
  opacity: 1;
  margin: ${(props) => props.theme.spacing[2]}px;
  margin-left: -0em !important;
`

export default AddLiquidity
