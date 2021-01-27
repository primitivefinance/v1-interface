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

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { Operation, UNISWAP_CONNECTOR } from '@/constants/index'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'

import { useReserves } from '@/hooks/data'
import useApprove from '@/hooks/transactions/useApprove'

import useTokenBalance from '@/hooks/useTokenBalance'
import useTokenTotalSupply from '@/hooks/useTokenTotalSupply'
import { useBlockNumber } from '@/hooks/data/useBlockNumber'

import { UNI_ROUTER_ADDRESS } from '@primitivefi/sdk'

import { usePositions } from '@/state/positions/hooks'
import {
  useItem,
  useUpdateItem,
  useHandleSubmitOrder,
} from '@/state/order/hooks'
import { useAddNotif } from '@/state/notifs/hooks'

import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount, JSBI } from '@uniswap/sdk'
import numeral from 'numeral'
import { useLiquidityActionHandlers, useLP } from '@/state/liquidity/hooks'
import { tryParseAmount } from '@/utils/index'

const RemoveLiquidity: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
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
      ? UNI_ROUTER_ADDRESS
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
  }, [
    submitOrder,
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
    <LiquidityContainer>
      <Spacer />
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
      <Spacer size="sm" />
      <Box row justifyContent="space-around">
        <Button
          variant="transparent"
          text="25%"
          onClick={() => {
            handleRatio(250)
          }}
        />
        <Button
          variant="transparent"
          text="50%"
          onClick={() => {
            handleRatio(500)
          }}
        />
        <Button
          variant="transparent"
          text="75%"
          onClick={() => {
            handleRatio(750)
          }}
        />
        <Button
          variant="transparent"
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
            label="To receive"
            data={numeral(calculateUnderlyingOutput()).format('0.00')}
            units={`${entity.underlying.symbol.toUpperCase()}`}
          />
        </>
      ) : (
        <>
          <Spacer size="sm" />
          <LineItem
            label="To receive"
            data={numeral(
              formatEther(
                calculateRemoveOutputs().underlyingValue.raw.toString()
              )
            ).format('0.00')}
            units={`${entity.underlying.symbol.toUpperCase()}`}
          />
          <Spacer size="sm" />
          <LineItem
            label="To Receive"
            data={numeral(
              formatEther(calculateRemoveOutputs().shortValue.raw.toString())
            ).format('0.00')}
            units={`SHORT`}
          />{' '}
        </>
      )}

      <Spacer />
      <Box row justifyContent="flex-start">
        {loading ? (
          <Button
            disabled={loading}
            full
            size="sm"
            onClick={() => {}}
            isLoading={false}
            text="Confirm"
          />
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
    </LiquidityContainer>
  )
}

const LiquidityContainer = styled.div`
  width: 34em;
`
export default RemoveLiquidity
