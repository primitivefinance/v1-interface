import React, { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import Label from '@/components/Label'
import LineItem from '@/components/LineItem'
import Loader from '@/components/Loader'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'
import Slider from '@/components/Slider'
import Tooltip from '@/components/Tooltip'
import Toggle from '@/components/Toggle'
import ToggleButton from '@/components/ToggleButton'
import { Operation, UNISWAP_CONNECTOR } from '@/constants/index'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'

import { useReserves } from '@/hooks/data'
import useApprove from '@/hooks/transactions/useApprove'
import useTokenAllowance, {
  useGetTokenAllowance,
} from '@/hooks/useTokenAllowance'
import useTokenBalance from '@/hooks/useTokenBalance'
import useTokenTotalSupply from '@/hooks/useTokenTotalSupply'
import { useBlockNumber } from '@/hooks/data/useBlockNumber'

import { Trade } from '@/lib/entities/trade'
import { UNISWAP_ROUTER02_V2 } from '@/lib/constants'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import { usePositions } from '@/state/positions/hooks'
import {
  useItem,
  useUpdateItem,
  useHandleSubmitOrder,
  useRemoveItem,
} from '@/state/order/hooks'
import { useAddNotif } from '@/state/notifs/hooks'

import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount, JSBI } from '@uniswap/sdk'
import numeral from 'numeral'
import {
  useLiquidityActionHandlers,
  useLP,
  tryParseAmount,
} from '@/state/liquidity/hooks'

const RemoveLiquidity: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  const removeItem = useRemoveItem()
  // toggle for advanced info
  const [advanced, setAdvanced] = useState(false)
  // state for pending txs
  const [submitting, setSubmit] = useState(false)

  const { data } = useBlockNumber()
  //slider
  const [ratio, setRatio] = useState(0)
  // option entity in order
  const { item, orderType, loading, approved } = useItem()
  // inputs for user quantity
  const { optionValue, underlyingValue } = useLP()
  const { onOptionInput, onUnderInput } = useLiquidityActionHandlers()
  // web3
  const { library, chainId } = useWeb3React()
  // pair and option entities
  const entity = item.entity
  const lpToken = item.market ? item.market.liquidityToken.address : ''
  const token0 = item.market ? item.market.token0.symbol : ''
  const token1 = item.market ? item.market.token1.symbol : ''
  const lp = useTokenBalance(lpToken)
  const lpTotalSupply = useTokenTotalSupply(lpToken)
  const spender =
    orderType === Operation.REMOVE_LIQUIDITY
      ? UNISWAP_ROUTER02_V2
      : UNISWAP_CONNECTOR[chainId]
  const optionBalance = useTokenBalance(item.entity.address)

  const handleApprove = useApprove()

  const handleRatioChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setRatio(Number(e.currentTarget.value))
      const liquidity = parseEther(lp)
        .mul(Number(e.currentTarget.value))
        .div(1000)
      onOptionInput(liquidity.toString())
    },
    [setRatio, lp, onOptionInput, optionValue, ratio]
  )

  const handleRatio = useCallback(
    (value) => {
      setRatio(value)
      const liquidity = parseEther(lp).mul(value).div(1000).toString()
      onOptionInput(liquidity.toString())
    },
    [onOptionInput, lp, ratio, optionValue, setRatio]
  )

  const handleSubmitClick = useCallback(() => {
    setSubmit(true)
    submitOrder(
      library,
      BigInt(optionValue.toString()),
      orderType,
      BigInt(underlyingValue.toString())
    )
    removeItem()
  }, [
    submitOrder,
    removeItem,
    item,
    library,
    orderType,
    lp,
    ratio,
    handleRatio,
    handleRatioChange,
  ])

  const calculateToken0PerToken1 = useCallback(() => {
    if (
      typeof item.market === 'undefined' ||
      !item.market.hasLiquidity ||
      item.market === null
    )
      return '0'
    const ratio = item.market.token1Price.raw.toSignificant(2)
    return ratio
  }, [item.market])

  const calculateToken1PerToken0 = useCallback(() => {
    if (
      typeof item.market === 'undefined' ||
      !item.market.hasLiquidity ||
      item.market === null
    )
      return '0'
    const ratio = item.market.token0Price.raw.toSignificant(2)
    return ratio
  }, [item.market])

  const caculatePoolShare = useCallback(() => {
    if (
      typeof item.market === 'undefined' ||
      item.market === null ||
      !item.market.hasLiquidity
    )
      return '0'
    const poolShare = BigNumber.from(parseEther(lpTotalSupply)).gt(0)
      ? BigNumber.from(parseEther(lp))
          .mul(parseEther('1'))
          .div(parseEther(lpTotalSupply))
      : '0'
    return (Number(formatEther(poolShare)) * 100).toFixed(2)
  }, [item.market, lp, lpTotalSupply])

  const calculateLiquidityValuePerShare = useCallback(() => {
    if (
      typeof item.market === 'undefined' ||
      item.market === null ||
      !item.market.hasLiquidity ||
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

  const calculateUnderlyingOutput = useCallback(() => {
    if (
      typeof item.market === 'undefined' ||
      item.market === null ||
      !item.market.hasLiquidity ||
      BigNumber.from(parseEther(lpTotalSupply)).isZero()
    )
      return '0'

    const liquidity = parseEther(lp).mul(ratio).div(1000)
    if (liquidity.isZero()) return '0'
    if (ratio === 0) return '0'
    const shortValue = item.market.getLiquidityValue(
      entity.redeem,
      new TokenAmount(
        item.market.liquidityToken,
        parseEther(lpTotalSupply).toString()
      ),
      new TokenAmount(item.market.liquidityToken, liquidity.toString())
    )

    const underlyingValue = item.market.getLiquidityValue(
      entity.underlying,
      new TokenAmount(
        item.market.liquidityToken,
        parseEther(lpTotalSupply).toString()
      ),
      new TokenAmount(item.market.liquidityToken, liquidity.toString())
    )

    const totalUnderlyingPerLp = formatEther(
      entity
        .proportionalLong(shortValue.raw.toString())
        .add(underlyingValue.raw.toString())
    )
    return totalUnderlyingPerLp
  }, [item.market, lp, lpTotalSupply, ratio])

  const calculateRemoveOutputs = useCallback(() => {
    if (
      typeof item.market === 'undefined' ||
      item.market === null ||
      !item.market.hasLiquidity ||
      BigNumber.from(parseEther(lpTotalSupply)).isZero() ||
      ratio === 0
    ) {
      const shortValue = new TokenAmount(entity.redeem, '0')
      const underlyingValue = new TokenAmount(entity.underlying, '0')
      return {
        shortValue,
        underlyingValue,
      }
    }

    const liquidity = parseEther(lp).mul(ratio).div(1000)
    const shortValue = item.market.getLiquidityValue(
      entity.redeem,
      new TokenAmount(
        item.market.liquidityToken,
        parseEther(lpTotalSupply).toString()
      ),
      new TokenAmount(item.market.liquidityToken, liquidity.toString())
    )

    const underlyingValue = item.market.getLiquidityValue(
      entity.underlying,
      new TokenAmount(
        item.market.liquidityToken,
        parseEther(lpTotalSupply).toString()
      ),
      new TokenAmount(item.market.liquidityToken, liquidity.toString())
    )

    return { shortValue, underlyingValue }
  }, [item.market, lp, lpTotalSupply, ratio])

  const calculateRequiredLong = useCallback(() => {
    if (
      typeof item.market === 'undefined' ||
      item.market === null ||
      !item.market.hasLiquidity ||
      BigNumber.from(parseEther(lpTotalSupply)).isZero()
    )
      return '0'

    const liquidity = parseEther(lp).mul(ratio).div(1000)
    if (liquidity.isZero()) return '0'
    if (ratio === 0) return '0'
    const shortValue = item.market.getLiquidityValue(
      entity.redeem,
      new TokenAmount(
        item.market.liquidityToken,
        parseEther(lpTotalSupply).toString()
      ),
      new TokenAmount(item.market.liquidityToken, liquidity.toString())
    )

    const totalRequiredLong = formatEther(
      entity.proportionalLong(shortValue.raw.toString())
    )
    return totalRequiredLong
  }, [item.market, lp, lpTotalSupply, ratio, item])

  const calculateBurn = useCallback(() => {
    if (typeof item.market === 'undefined' || !item.market.hasLiquidity)
      return '0'
    const liquidity = parseEther(lp)
      .mul(parseEther(ratio.toString()))
      .div(parseEther('1000'))
    return formatEther(liquidity)
  }, [item.market, lp, ratio])

  const title = {
    text: 'Withdraw Liquidity',
    tip:
      'Withdraw the assets from the pair proportional to your share of the pool. Fees are included, and options are closed.',
  }

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
      <Toggle>
        <ToggleButton
          active={orderType === Operation.REMOVE_LIQUIDITY_CLOSE}
          onClick={() =>
            updateItem(item, Operation.REMOVE_LIQUIDITY_CLOSE, item.market)
          }
          text="Exit & Close"
        />
        <ToggleButton
          active={orderType === Operation.REMOVE_LIQUIDITY}
          onClick={() =>
            updateItem(item, Operation.REMOVE_LIQUIDITY, item.market)
          }
          text="Exit"
        />
      </Toggle>
      <Spacer size="sm" />
      <LineItem
        label={'Amount'}
        data={Math.round(10 * (ratio / 10)) / 10 + '%'}
        units={'%'}
      ></LineItem>
      <Spacer size="sm" />
      <Slider
        min={1}
        max={1000}
        step={1}
        value={ratio}
        onChange={handleRatioChange}
      />

      <Box row justifyContent="flex-start">
        <Button
          variant="secondary"
          text="25%"
          onClick={() => {
            handleRatio(250)
          }}
        />
        <div style={{ width: '5px' }} />
        <Button
          variant="secondary"
          text="50%"
          onClick={() => {
            handleRatio(500)
          }}
        />
        <div style={{ width: '5px' }} />
        <Button
          variant="secondary"
          text="75%"
          onClick={() => {
            handleRatio(750)
          }}
        />
        <div style={{ width: '5px' }} />
        <Button
          variant="secondary"
          text="100%"
          onClick={() => {
            handleRatio(1000)
          }}
        />
      </Box>

      <Spacer size="sm" />
      <LineItem
        label="This requires"
        data={`${numeral(calculateBurn()).format('0.00')}`}
        units={`UNI-V2 LP`}
      />

      {orderType === Operation.REMOVE_LIQUIDITY_CLOSE ? (
        <>
          <Spacer size="sm" />
          <LineItem
            label="And requires"
            data={`${numeral(calculateRequiredLong()).format('0.00')}`}
            units={`LONG`}
          />
          {!formatEther(
            parseEther(calculateRequiredLong()).sub(parseEther(optionBalance))
          ) ? (
            <>
              <Spacer size="sm" />
              <LineItem
                label="You need"
                data={`${numeral(
                  formatEther(
                    parseEther(calculateRequiredLong()).sub(
                      parseEther(optionBalance)
                    )
                  )
                ).format('0.00')}`}
                units={`LONG`}
              />{' '}
            </>
          ) : (
            <> </>
          )}{' '}
          <Spacer size="sm" />
          <LineItem
            label="You will receive"
            data={numeral(calculateUnderlyingOutput()).format('0.00')}
            units={`${entity.underlying.symbol.toUpperCase()}`}
          />
        </>
      ) : (
        <>
          <Spacer size="sm" />
          <LineItem
            label="You will receive"
            data={numeral(
              formatEther(
                calculateRemoveOutputs().underlyingValue.raw.toString()
              )
            ).format('0.00')}
            units={`${entity.underlying.symbol.toUpperCase()}`}
          />
          <Spacer size="sm" />
          <LineItem
            label="You will receive"
            data={numeral(
              formatEther(calculateRemoveOutputs().shortValue.raw.toString())
            ).format('0.00')}
            units={`${entity.redeem.symbol.toUpperCase()}`}
          />{' '}
        </>
      )}

      <Spacer size="sm" />
      <IconButton
        text="Advanced"
        variant="transparent"
        onClick={() => setAdvanced(!advanced)}
      >
        {advanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
      <Spacer size="sm" />

      {advanced ? (
        <>
          <LineItem
            label="Short per LP token"
            data={`${calculateLiquidityValuePerShare().shortPerLp}`}
          />
          <Spacer size="sm" />
          <LineItem
            label="Underlying per LP Token"
            data={`${calculateLiquidityValuePerShare().underlyingPerLp}`}
          />
          <Spacer size="sm" />
          <LineItem
            label={`Total ${entity.underlying.symbol.toUpperCase()} per LP Token`}
            data={`${calculateLiquidityValuePerShare().totalUnderlyingPerLp}`}
          />
          <Spacer size="sm" />
          <LineItem
            label={`${token0} per ${token1}`}
            data={calculateToken0PerToken1()}
          />
          <Spacer size="sm" />
          <LineItem
            label={`${token1} per ${token0}`}
            data={calculateToken1PerToken0()}
          />
          <Spacer size="sm" />
          <LineItem
            label={`Your Share % of Pool`}
            data={caculatePoolShare()}
            units={`%`}
          />
          <Spacer />
        </>
      ) : (
        <> </>
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
            {approved[1] ? (
              <></>
            ) : (
              <Button
                disabled={submitting}
                full
                size="sm"
                onClick={() => handleApprove(lpToken, spender)}
                isLoading={submitting}
                text="Approve LP"
              />
            )}

            {approved[0] ? (
              <></>
            ) : (
              <Button
                disabled={submitting}
                full
                size="sm"
                onClick={() => handleApprove(item.entity.address, spender)}
                isLoading={submitting}
                text="Approve Options"
              />
            )}
            {!approved[0] || !approved[1] ? null : (
              <Button
                disabled={submitting || ratio === 0}
                full
                size="sm"
                onClick={handleSubmitClick}
                isLoading={submitting}
                text="Confirm Transaction"
              />
            )}
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
const StyledRatio = styled.h4`
  color: ${(props) => props.theme.color.white};
`
export default RemoveLiquidity
