import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import LineItem from '@/components/LineItem'
import Spacer from '@/components/Spacer'
import Slider from '@/components/Slider'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'
import { useAddNotif } from '@/state/notifs/hooks'

import useApprove from '@/hooks/transactions/useApprove'

import useGetPair from '@/hooks/useGetPair'
import useTokenBalance from '@/hooks/useTokenBalance'
import useTokenTotalSupply from '@/hooks/useTokenTotalSupply'
import { useBlockNumber } from '@/hooks/data/useBlockNumber'

import { PRIMITIVE_ROUTER, SignitureData, TRADER } from '@primitivefi/sdk'

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
import { usePermit } from '@/hooks/transactions/usePermit'

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
  const lp = useTokenBalance(lpToken)
  const lpTotalSupply = useTokenTotalSupply(lpToken)

  const spender = PRIMITIVE_ROUTER[chainId].address
  const optionBalance = useTokenBalance(item.entity.address)

  const onApprove = useApprove()
  const handlePermit = usePermit()

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

  const handleApprovalPermitRDM = useCallback(
    (spender: string, amount: BigNumber) => {
      handlePermit(
        entity.redeem.address,
        TRADER[chainId].address,
        amount.toString()
      )
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
  const handleApprovalPermitLP = useCallback(
    (spender: string, amount: BigNumber) => {
      handlePermit(lpToken, spender, amount.toString())
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
    return approved[0] || calculateLongBurn().isZero()
  }, [approved, item.entity, ratio])

  const isLPApproved = useCallback(() => {
    return approved[1] || signData
  }, [approved, item.entity, signData, ratio])

  const uninitializedMarket = useCallback(() => {
    return (
      typeof item.market === 'undefined' ||
      item.market === null ||
      !item.market.hasLiquidity ||
      BigNumber.from(parseEther(lpTotalSupply)).isZero() ||
      ratio === 0
    )
  }, [item.market, item.market.hasLiquidity, lpTotalSupply, ratio])

  const calculateLPBurn = useCallback(() => {
    if (uninitializedMarket()) return parseEther('0')
    const liquidity = parseEther(lp)
      .mul(parseEther(ratio.toString()))
      .div(parseEther('1000'))
    return liquidity
  }, [uninitializedMarket, lp, ratio])

  const calculateRemoveOutputs = useCallback(() => {
    if (uninitializedMarket()) {
      const shortValue = new TokenAmount(entity.redeem, '0')
      const underlyingValue = new TokenAmount(entity.underlying, '0')
      return {
        shortValue,
        underlyingValue,
      }
    }
    const liquidity = calculateLPBurn()
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
  }, [
    item.market,
    uninitializedMarket,
    entity.redeem,
    entity.underlying,
    calculateLPBurn,
  ])

  const calculateLongBurn = useCallback((): BigNumber => {
    if (uninitializedMarket()) return parseEther('0')
    const { shortValue } = calculateRemoveOutputs()
    const proportionalLong = entity.proportionalLong(shortValue.raw.toString())
    const balance = parseEther(optionBalance)
    const longBurned = proportionalLong.gt(balance) ? balance : proportionalLong
    return longBurned
  }, [uninitializedMarket, calculateRemoveOutputs, optionBalance])

  const calculateShortBurn = useCallback((): BigNumber => {
    if (uninitializedMarket()) return parseEther('0')
    const longBurned = calculateLongBurn()
    const shortBurned = entity.proportionalShort(longBurned.toString())
    return shortBurned
  }, [uninitializedMarket, calculateLongBurn])

  const calculateReceived = useCallback(() => {
    let underlyingReceived = '0'
    let shortReceived = '0'
    if (uninitializedMarket()) {
      return { shortReceived, underlyingReceived }
    }
    const { shortValue, underlyingValue } = calculateRemoveOutputs()
    const maxLong = entity.proportionalLong(shortValue.raw.toString())
    const longBurn = calculateLongBurn()
    const shortBurn = calculateShortBurn()
    if (maxLong.eq(longBurn)) {
      underlyingReceived = formatEther(
        maxLong.add(underlyingValue.raw.toString())
      )
      shortReceived = '0'
    } else {
      underlyingReceived = formatEther(
        longBurn.add(underlyingValue.raw.toString())
      )

      shortReceived = formatEther(
        BigNumber.from(shortValue.raw.toString()).sub(shortBurn)
      )
    }
    return { shortReceived, underlyingReceived }
  }, [
    uninitializedMarket,
    calculateRemoveOutputs,
    calculateLongBurn,
    calculateShortBurn,
  ])

  useEffect(() => {
    const liquidity = parseEther(lp).mul(Number(1000)).div(1000)
    onOptionInput(liquidity.toString())
  }, [lp])

  return (
    <LiquidityContainer>
      <Spacer />
      <LineItem
        label="Burn"
        data={`${numeral(formatEther(calculateLPBurn())).format('0.00')}`}
        units={`SLP`}
      />
      <Spacer size="sm" />
      <LineItem
        label="Burn"
        data={`${numeral(formatEther(calculateLongBurn())).format('0.00')}`}
        units={`LONG`}
      />
      <Spacer size="sm" />
      <LineItem
        label="Burn"
        data={`${numeral(formatEther(calculateShortBurn())).format('0.00')}`}
        units={`SHORT`}
      />
      <Spacer size="sm" />
      <LineItem
        label="Receive"
        data={numeral(calculateReceived().underlyingReceived).format('0.00')}
        units={
          entity.isWethCall
            ? 'ETH'
            : `${entity.underlying.symbol.toUpperCase()}`
        }
      />
      <Spacer size="sm" />
      <LineItem
        label="Receive"
        data={numeral(calculateReceived().shortReceived).format('0.00')}
        units={`SHORT`}
      />{' '}
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
                onClick={() =>
                  handleApprovalPermitLP(spender, calculateLPBurn())
                }
                isLoading={submitting}
                text="Permit LP Tokens"
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
                  handleApprovalPermitRDM(
                    TRADER[chainId].address,
                    calculateShortBurn()
                  )
                }
                isLoading={submitting}
                text="Permit RDM"
              />
            )}
            {!isOptionApproved() || !isLPApproved() ? null : (
              <Button
                disabled={submitting}
                full
                size="sm"
                onClick={handleSubmitClick}
                isLoading={submitting}
                text={'Remove Liquidity'}
              />
            )}
          </>
        )}
      </Box>
    </LiquidityContainer>
  )
}

const LiquidityContainer = styled.div`
  width: 100%;
`
export default RemoveLiquidity
