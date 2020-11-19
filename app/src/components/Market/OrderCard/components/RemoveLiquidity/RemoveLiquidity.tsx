import React, { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import Label from '@/components/Label'
import LineItem from '@/components/LineItem'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'
import Slider from '@/components/Slider'
import Tooltip from '@/components/Tooltip'
import { Operation, UNISWAP_CONNECTOR } from '@/constants/index'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'

import { useReserves } from '@/hooks/data'
import useApprove from '@/hooks/useApprove'
import useTokenAllowance from '@/hooks/useTokenAllowance'
import useTokenBalance from '@/hooks/useTokenBalance'
import useTokenTotalSupply from '@/hooks/useTokenTotalSupply'

import { Trade } from '@/lib/entities/trade'
import { UNISWAP_ROUTER02_V2 } from '@/lib/constants'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'

import {
  useItem,
  useUpdateItem,
  useHandleSubmitOrder,
  useRemoveItem,
} from '@/state/order/hooks'
import { useAddNotif } from '@/state/notifs/hooks'

import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount } from '@uniswap/sdk'
import numeral from 'numeral'

const AddLiquidity: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  const removeItem = useRemoveItem()
  // toggle for advanced info
  const [advanced, setAdvanced] = useState(false)
  // state for pending txs
  const [submitting, setSubmit] = useState(false)

  //slider
  const [ratio, setRatio] = useState(100)
  // option entity in order
  const { item, orderType, approved, lpApproved, loading } = useItem()
  // inputs for user quantity
  const [inputs, setInputs] = useState({
    primary: '',
    secondary: '',
  })
  // web3
  const { library, chainId } = useWeb3React()
  // pair and option entities
  const addNotif = useAddNotif()
  const entity = item.entity
  const underlyingToken: Token = new Token(
    entity.chainId,
    entity.assetAddresses[0],
    18,
    item.asset.toUpperCase()
  )
  const lpPair = useReserves(
    underlyingToken,
    new Token(entity.chainId, entity.assetAddresses[2], 18, 'SHORT')
  ).data

  const lpToken = lpPair ? lpPair.liquidityToken.address : ''
  const token0 = lpPair ? lpPair.token0.symbol : ''
  const token1 = lpPair ? lpPair.token1.symbol : ''
  const lp = useTokenBalance(lpToken)
  const lpTotalSupply = useTokenTotalSupply(lpToken)
  const spender = UNISWAP_CONNECTOR[chainId]
  const tokenAllowance = useTokenAllowance(lpToken, spender)
  const underlyingTokenBalance = useTokenBalance(underlyingToken.address)
  const { onApprove } = useApprove(lpToken, spender)
  const optionAllowance = useTokenAllowance(item.address, spender)
  const onApproveOption = useApprove(item.address, spender)

  const handleInputChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setInputs({ ...inputs, [e.currentTarget.name]: e.currentTarget.value })
    },
    [setInputs, inputs]
  )

  // FIX
  const handleSetMax = () => {
    const max = Math.round(
      ((+underlyingTokenBalance /
        (+calculateLiquidityValuePerShare().totalUnderlyingPerLp +
          Number.EPSILON)) *
        100) /
        100
    )
    setInputs({ ...inputs, primary: max.toString() })
  }

  const handleRatioChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setRatio(Number(e.currentTarget.value))
      const liquidity = formatEther(parseEther(lp).mul(ratio).div(1000))
      setInputs({ ...inputs, primary: liquidity })
    },
    [setRatio, lp]
  )

  const handleRatio = useCallback(
    (value) => {
      setRatio(value)
      const liquidity = formatEther(parseEther(lp).mul(value).div(1000))
      setInputs({ ...inputs, primary: liquidity })
    },
    [setInputs, lp, ratio, inputs]
  )

  const handleSubmitClick = useCallback(() => {
    setSubmit(true)
    submitOrder(
      library,
      item?.address,
      Number(inputs.primary),
      orderType,
      Number(inputs.secondary)
    )
    removeItem()
  }, [submitOrder, removeItem, item, library, inputs, orderType, lp, ratio])

  const calculateToken0PerToken1 = useCallback(() => {
    if (typeof lpPair === 'undefined' || lpPair === null) return '0'
    const ratio = lpPair.token0Price.raw.toSignificant(2)
    return ratio
  }, [lpPair])

  const calculateToken1PerToken0 = useCallback(() => {
    if (typeof lpPair === 'undefined' || lpPair === null) return '0'
    const ratio = lpPair.token1Price.raw.toSignificant(2)
    return ratio
  }, [lpPair])

  const caculatePoolShare = useCallback(() => {
    if (typeof lpPair === 'undefined' || lpPair === null) return '0'
    const poolShare = BigNumber.from(parseEther(lpTotalSupply)).gt(0)
      ? BigNumber.from(parseEther(lp))
          .mul(parseEther('1'))
          .div(parseEther(lpTotalSupply))
      : '0'
    return (Number(formatEther(poolShare)) * 100).toFixed(2)
  }, [lpPair, lp, lpTotalSupply])

  const calculateLiquidityValuePerShare = useCallback(() => {
    if (
      typeof lpPair === 'undefined' ||
      lpPair === null ||
      BigNumber.from(parseEther(lpTotalSupply)).isZero()
    ) {
      return {
        shortPerLp: '0',
        underlyingPerLp: '0',
        totalUnderlyingPerLp: '0',
      }
    }
    const SHORT: Token =
      lpPair.token0.address === item.entity.assetAddresses[2]
        ? lpPair.token0
        : lpPair.token1
    const UNDERLYING: Token =
      lpPair.token1.address === item.entity.assetAddresses[2]
        ? lpPair.token0
        : lpPair.token1

    const shortValue = lpPair.getLiquidityValue(
      SHORT,
      new TokenAmount(
        lpPair.liquidityToken,
        parseEther(lpTotalSupply).toString()
      ),
      new TokenAmount(lpPair.liquidityToken, parseEther('1').toString())
    )

    const underlyingValue = lpPair.getLiquidityValue(
      UNDERLYING,
      new TokenAmount(
        lpPair.liquidityToken,
        parseEther(lpTotalSupply).toString()
      ),
      new TokenAmount(lpPair.liquidityToken, parseEther('1').toString())
    )

    const shortPerLp = shortValue ? formatEther(shortValue.raw.toString()) : '0'
    const underlyingPerLp = underlyingValue
      ? formatEther(underlyingValue.raw.toString())
      : '0'

    const totalUnderlyingPerLp = formatEther(
      BigNumber.from(shortValue.raw.toString())
        .mul(item.entity.optionParameters.base.quantity)
        .div(item.entity.optionParameters.quote.quantity)
        .add(underlyingValue.raw.toString())
    )

    return { shortPerLp, underlyingPerLp, totalUnderlyingPerLp }
  }, [lpPair, lp, lpTotalSupply, inputs])

  const calculateUnderlyingOutput = useCallback(() => {
    if (
      typeof lpPair === 'undefined' ||
      lpPair === null ||
      BigNumber.from(parseEther(lpTotalSupply)).isZero()
    )
      return '0'

    const liquidity = parseEther(lp).mul(ratio).div(1000)
    if (liquidity.isZero()) return '0'
    if (ratio === 0) return '0'
    const base = item.entity.optionParameters.base.quantity
    const quote = item.entity.optionParameters.quote.quantity
    const SHORT: Token =
      lpPair.token0.address === item.entity.assetAddresses[2]
        ? lpPair.token0
        : lpPair.token1
    const UNDERLYING: Token =
      lpPair.token1.address === item.entity.assetAddresses[2]
        ? lpPair.token0
        : lpPair.token1

    const shortValue = lpPair.getLiquidityValue(
      SHORT,
      new TokenAmount(
        lpPair.liquidityToken,
        parseEther(lpTotalSupply).toString()
      ),
      new TokenAmount(lpPair.liquidityToken, liquidity.toString())
    )

    const underlyingValue = lpPair.getLiquidityValue(
      UNDERLYING,
      new TokenAmount(
        lpPair.liquidityToken,
        parseEther(lpTotalSupply).toString()
      ),
      new TokenAmount(lpPair.liquidityToken, liquidity.toString())
    )

    const totalUnderlyingPerLp = formatEther(
      BigNumber.from(shortValue.raw.toString())
        .mul(base)
        .div(quote)
        .add(underlyingValue.raw.toString())
    )
    return totalUnderlyingPerLp
  }, [lpPair, lp, lpTotalSupply, inputs, ratio])

  const calculateBurn = useCallback(() => {
    if (typeof lpPair === 'undefined' || lpPair === null) return '0'
    const liquidity = parseEther(lp)
      .mul(parseEther(ratio.toString()))
      .div(parseEther('1000'))
    return formatEther(liquidity)
  }, [lpPair, lp, ratio])

  const title = {
    text: 'Withdraw Liquidity',
    tip:
      'Withdraw the assets from the pair proportional to your share of the pool. Fees are included, and options are closed.',
  }

  // FIX

  useEffect(() => {
    if (tokenAllowance) {
      const approve: boolean = parseEther(tokenAllowance).gt(
        parseEther(inputs.primary || '0')
      )
      console.log(lpApproved)
      if (approve) {
        updateItem(item, orderType, loading, approve)
      }
    }
    if (optionAllowance) {
      const app: boolean = parseEther(optionAllowance).gt(
        parseEther(calculateLiquidityValuePerShare().shortPerLp || '0')
      )
      console.log(approved)
      if (app) {
        updateItem(item, orderType, loading, approved, app)
      }
    }
  }, [item, orderType, loading, optionAllowance, tokenAllowance])
  // END FIX

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

      <Spacer />
      <LineItem
        label="This requires"
        data={`${numeral(calculateBurn()).format('0.00')}`}
        units={`UNI-V2 LP`}
      />
      <Spacer />
      <LineItem
        label="You will receive"
        data={numeral(calculateUnderlyingOutput()).format('0.00')}
        units={`${item.asset.toUpperCase()}`}
      />
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
          <Spacer size="sm" />
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
            label={`Total ${item.asset.toUpperCase()} per LP Token`}
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
        {!lpApproved ? (
          <Button
            disabled={!tokenAllowance || submitting}
            full
            size="sm"
            onClick={onApprove}
            isLoading={submitting}
            text="Approve LP"
          />
        ) : (
          <></>
        )}

        {!approved ? (
          <Button
            disabled={!optionAllowance || submitting}
            full
            size="sm"
            onClick={onApproveOption.onApprove}
            isLoading={submitting}
            text="Approve SHORT"
          />
        ) : (
          <></>
        )}
        {!approved || !lpApproved ? null : (
          <Button
            disabled={!inputs || submitting}
            full
            size="sm"
            onClick={handleSubmitClick}
            isLoading={submitting}
            text="Review"
          />
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

export default AddLiquidity
