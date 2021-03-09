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
import { Operation } from '@/constants/index'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'
import { useAddNotif } from '@/state/notifs/hooks'

import { useReserves } from '@/hooks/data'
import useApprove from '@/hooks/transactions/useApprove'

import useGetPair from '@/hooks/useGetPair'
import useTokenBalance from '@/hooks/useTokenBalance'
import useTokenTotalSupply from '@/hooks/useTokenTotalSupply'
import { useBlockNumber } from '@/hooks/data/useBlockNumber'
import isZero from '@/utils/isZero'

import {
  PRIMITIVE_ROUTER,
  SUSHI_ROUTER_ADDRESS,
  Venue,
  SignitureData,
} from '@primitivefi/sdk'

import { usePositions } from '@/state/positions/hooks'
import {
  useItem,
  useUpdateItem,
  useHandleSubmitOrder,
} from '@/state/order/hooks'

import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount, JSBI, ChainId } from '@sushiswap/sdk'
import numeral from 'numeral'
import { useLiquidityActionHandlers, useLP } from '@/state/liquidity/hooks'
import { tryParseAmount } from '@/utils/index'
import { usePermit, useDAIPermit } from '@/hooks/transactions/usePermit'

const RemoveLiquidity: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  const [signData, setSignData] = useState<SignitureData>(null)
  // toggle for advanced info
  const [advanced, setAdvanced] = useState(false)
  // state for pending txs
  const [submitting, setSubmit] = useState(false)
  const addNotif = useAddNotif()
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
  const lpToken =
    chainId === ChainId.RINKEBY
      ? useGetPair(entity.underlying.address, entity.redeem.address)
      : item.market
      ? item.market.liquidityToken.address
      : ''
  const token0 = item.market ? item.market.token0.symbol : ''
  const token1 = item.market ? item.market.token1.symbol : ''
  const lp = useTokenBalance(lpToken)
  const lpTotalSupply = useTokenTotalSupply(lpToken)

  const isUniswap = item.venue === Venue.UNISWAP ? true : false
  const spender = PRIMITIVE_ROUTER[chainId].address
  const optionBalance = useTokenBalance(item.entity.address)

  const onApprove = useApprove()
  const handlePermit = usePermit()
  const handleDAIPermit = useDAIPermit()

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
      BigInt(underlyingValue.toString()),
      signData
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
    signData,
  ])

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

    const totalRequiredLong = entity.proportionalLong(shortValue.raw.toString())

    const required = totalRequiredLong.gt(parseEther(optionBalance))
      ? optionBalance
      : formatEther(totalRequiredLong)
    return required
  }, [item.market, lp, lpTotalSupply, ratio, item, optionBalance])

  const calculateBurn = useCallback(() => {
    if (typeof item.market === 'undefined' || !item.market.hasLiquidity)
      return '0'
    const liquidity = parseEther(lp)
      .mul(parseEther(ratio.toString()))
      .div(parseEther('1000'))
    return formatEther(liquidity)
  }, [item.market, lp, ratio])

  const requiresAdditionalLong = useCallback(() => {
    const additional = parseEther(calculateRequiredLong()).sub(
      parseEther(optionBalance)
    )
    return additional
  }, [calculateRequiredLong, optionBalance])

  const handleApproval = useCallback(
    (token: string, spender: string, amount: string) => {
      onApprove(token, spender, amount)
        .then()
        .catch((error) => {
          addNotif(
            0,
            `Approving ${entity.underlying.symbol.toUpperCase()}`,
            error.message,
            ''
          )
        })
    },
    [entity.underlying, onApprove]
  )

  const handleApprovalPermit = useCallback(
    (spender: string, amount: string) => {
      console.log(lpToken)
      handlePermit(lpToken, spender, parseEther(amount).toString())
        .then((data) => {
          console.log({ data })
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
    },
    [entity.underlying, lpToken, handlePermit, underlyingValue, setSignData]
  )

  const isOptionApproved = useCallback(() => {
    return approved[0] /* || isZero(parseEther(calculateRequiredLong())) */
  }, [approved, item.entity])

  const isLPApproved = useCallback(() => {
    return /* true */ approved[1] || signData
  }, [approved, item.entity, signData])

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
        units={`SLP`}
      />

      {orderType === Operation.REMOVE_LIQUIDITY_CLOSE ? (
        <>
          <Spacer size="sm" />
          <LineItem
            label="And requires"
            data={`${numeral(calculateRequiredLong()).format('0.00a')}`}
            units={`LONG`}
          />
          {requiresAdditionalLong().gt(0) ? (
            <>
              <Spacer size="sm" />
              <LineItem
                label="You need"
                data={`${numeral(formatEther(requiresAdditionalLong())).format(
                  '0.00a'
                )}`}
                units={`LONG`}
              />{' '}
            </>
          ) : (
            <> </>
          )}{' '}
          <Spacer size="sm" />
          <LineItem
            label="To receive"
            data={numeral(calculateUnderlyingOutput()).format('0.00a')}
            units={
              entity.isWethCall
                ? 'ETH'
                : `${entity.underlying.symbol.toUpperCase()}`
            }
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
            ).format('0.00a')}
            units={
              entity.isWethCall
                ? 'ETH'
                : `${entity.underlying.symbol.toUpperCase()}`
            }
          />
          <Spacer size="sm" />
          <LineItem
            label="To Receive"
            data={numeral(
              formatEther(calculateRemoveOutputs().shortValue.raw.toString())
            ).format('0.00a')}
            units={`SHORT`}
          />{' '}
        </>
      )}

      <Spacer size="sm" />
      <Box row justifyContent="flex-start">
        {loading ? (
          <Button
            disabled={loading}
            variant="secondary"
            full
            size="sm"
            onClick={() => {}}
            isLoading={true}
            text="Remove Liquidity"
          />
        ) : (
          <>
            {isLPApproved() ? (
              <></>
            ) : (
              <Button
                disabled={submitting}
                full
                size="sm"
                onClick={
                  () =>
                    handleApprovalPermit(
                      spender,
                      calculateBurn()
                    ) /* () =>
                    handleApproval(lpToken, spender, calculateBurn()) */
                }
                isLoading={submitting}
                text="Approve LP"
              />
            )}

            {isOptionApproved() ? (
              <></>
            ) : (
              <Button
                disabled={submitting}
                full
                size="sm"
                onClick={() =>
                  handleApproval(
                    item.entity.address,
                    spender,
                    calculateRequiredLong()
                  )
                }
                isLoading={submitting}
                text="Approve Options"
              />
            )}
            {requiresAdditionalLong().gt(0) ? (
              <>
                <Button
                  full
                  size="sm"
                  href={`/markets/${encodeURIComponent(
                    entity.underlying.symbol.toUpperCase() === 'DAI'
                      ? entity.strike.symbol.toLowerCase()
                      : entity.underlying.symbol.toLowerCase()
                  )}`}
                  text={`Buy ${numeral(
                    formatEther(requiresAdditionalLong())
                  ).format('0.00')} Options`}
                />{' '}
              </>
            ) : (
              <> </>
            )}
            {!isOptionApproved() || !isLPApproved() ? null : (
              <Button
                disabled={
                  submitting || ratio === 0 || requiresAdditionalLong().gt(0)
                }
                full
                size="sm"
                onClick={handleSubmitClick}
                isLoading={submitting}
                text={
                  requiresAdditionalLong().gt(0)
                    ? 'Remove Liquidity'
                    : 'Remove Liquidity'
                }
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
