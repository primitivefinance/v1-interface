import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import ethers from 'ethers'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import LineItem from '@/components/LineItem'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'
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

import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount } from '@uniswap/sdk'
import { useAddNotif } from '@/state/notifs/hooks'
import { pathToFileURL } from 'url'

const AddLiquidity: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  const removeItem = useRemoveItem()
  // toggle for advanced info
  const [advanced, setAdvanced] = useState(false)
  // state for pending txs
  const [submitting, setSubmit] = useState(false)
  // option entity in order
  const { item, orderType } = useItem()
  // inputs for user quantity
  const [inputs, setInputs] = useState({
    primary: '',
    secondary: '',
  })
  // web3
  const { library, chainId } = useWeb3React()
  // approval
  const addNotif = useAddNotif()
  const [approved, setApproved] = useState(false)
  // pair and option entities
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

  const hasLiquidity = lpPair
    ? lpPair.reserve0.greaterThan('0')
      ? true
      : false
    : false
  const lpToken = lpPair ? lpPair.liquidityToken.address : ''
  const token0 = lpPair ? lpPair.token0.symbol : ''
  const token1 = lpPair ? lpPair.token1.symbol : ''
  const underlyingTokenBalance = useTokenBalance(underlyingToken.address)
  const lp = useTokenBalance(lpToken)
  const lpTotalSupply = useTokenTotalSupply(lpToken)
  const spender = UNISWAP_CONNECTOR[chainId]
  const tokenAllowance = useTokenAllowance(underlyingToken.address, spender)
  const { onApprove } = useApprove(underlyingToken.address, spender)

  const underlyingAmount: TokenAmount = new TokenAmount(
    underlyingToken,
    parseEther(underlyingTokenBalance).toString()
  )

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
  }, [submitOrder, removeItem, item, library, inputs, orderType])

  const calculateToken0PerToken1 = useCallback(() => {
    if (typeof lpPair === 'undefined' || lpPair === null) return '0'
    const ratio = lpPair.token1Price.raw.toSignificant(2)
    return ratio
  }, [lpPair])

  const calculateToken1PerToken0 = useCallback(() => {
    if (typeof lpPair === 'undefined' || lpPair === null) return '0'
    const ratio = lpPair.token0Price.raw.toSignificant(2)
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

  const calculateOutput = useCallback(() => {
    if (typeof lpPair === 'undefined' || lpPair === null) {
      const input =
        inputs.primary !== '' ? parseEther(inputs.primary.toString()) : '0'
      const output =
        inputs.secondary !== '' ? parseEther(inputs.secondary.toString()) : '0'
      const sum = BigNumber.from(output).add(input)
      return formatEther(sum.toString())
    }
    const reservesA = lpPair.reserveOf(
      new Token(chainId, item.entity.assetAddresses[2], 18)
    )
    const reservesB = lpPair.reserveOf(
      new Token(chainId, item.entity.assetAddresses[0], 18)
    )
    const input =
      inputs.primary !== '' ? parseEther(inputs.primary.toString()) : '0'
    const inputShort = BigNumber.from(input) // pair has short tokens, so need to convert our desired options to short options
      .mul(item.entity.optionParameters.quote.quantity)
      .div(item.entity.optionParameters.base.quantity)
    const quote = Trade.getQuote(
      inputShort,
      reservesA.raw.toString(),
      reservesB.raw.toString()
    )
    const sum = BigNumber.from(quote).add(input)
    return formatEther(sum.toString())
  }, [lpPair, lp, lpTotalSupply, inputs])

  const calculateLiquidityValuePerShare = useCallback(() => {
    if (
      typeof lpPair === 'undefined' ||
      lpPair === null ||
      BigNumber.from(parseEther(lpTotalSupply)).isZero()
    )
      return {
        shortPerLp: '0',
        underlyingPerLp: '0',
        totalUnderlyingPerLp: '0',
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

  const calculateImpliedPrice = useCallback(() => {
    if (typeof lpPair === 'undefined' || lpPair === null) {
      const input =
        inputs.primary !== '' ? parseEther(inputs.primary.toString()) : '0'
      const inputShort = BigNumber.from(input) // pair has short tokens, so need to convert our desired options to short options
        .mul(item.entity.optionParameters.quote.quantity)
        .div(item.entity.optionParameters.base.quantity)
      const output =
        inputs.secondary !== '' ? parseEther(inputs.secondary.toString()) : '0'
      const path = [
        item.entity.assetAddresses[2],
        item.entity.assetAddresses[0],
      ]
      const quote = Trade.getSpotPremium(
        item.entity.optionParameters.base.quantity,
        item.entity.optionParameters.quote.quantity,
        path,
        [inputShort, output]
      )
      return formatEther(quote.toString())
    }
    const reservesA = lpPair.reserveOf(
      new Token(chainId, item.entity.assetAddresses[2], 18)
    )
    const reservesB = lpPair.reserveOf(
      new Token(chainId, item.entity.assetAddresses[0], 18)
    )
    const path = [item.entity.assetAddresses[2], item.entity.assetAddresses[0]]
    const quote = Trade.getSpotPremium(
      item.entity.optionParameters.quote.quantity,
      item.entity.optionParameters.base.quantity,
      path,
      [reservesA.raw.toString(), reservesB.raw.toString()]
    )
    return formatEther(quote.toString())
  }, [lpPair, lp, lpTotalSupply, inputs])

  // FIX
  const isApproved = useCallback(() => {
    const approved: boolean = parseEther(tokenAllowance).gt(
      parseEther(inputs.primary || '0')
    )
    setApproved(approved)
    return approved
  }, [tokenAllowance, approved])

  useEffect(() => {
    setApproved(isApproved())
  }, [isApproved, setApproved, inputs])

  const handleApproval = useCallback(() => {
    onApprove()
      .then((tx: ethers.Transaction) => {
        if (tx.hash) {
          setApproved(true)
        }
      })
      .catch((error) => {
        addNotif(0, `Approving ${item.asset.toUpperCase()}`, error.message, '')
      })
  }, [inputs, tokenAllowance, onApprove, setApproved])

  // End FIX

  const title = {
    text: 'Add Liquidity',
    tip:
      'Underlying tokens are used to mint short tokens, which are provided as liquidity to the pair, along with additional underlying tokens',
  }

  const noLiquidityTitle = {
    text: 'This pair has no liquidity.',
    tip:
      'Providing liquidity to this pair will set the ratio between the tokens.',
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

      <Spacer />
      {hasLiquidity ? (
        <PriceInput
          name="primary"
          title={`Options Input`}
          quantity={inputs.primary}
          onChange={handleInputChange}
          onClick={() => console.log('Max unavailable.')} //
        />
      ) : (
        <>
          <StyledSubtitle>
            <Tooltip text={noLiquidityTitle.tip}>
              {noLiquidityTitle.text}
            </Tooltip>
          </StyledSubtitle>
          <Spacer />
          <PriceInput
            name="primary"
            title={`Options Input`}
            quantity={inputs.primary}
            onChange={handleInputChange}
            onClick={() => console.log('Max unavailable.')} //
          />
          <Spacer />
          <StyledText>Per</StyledText>
          <Spacer />
          <PriceInput
            name="secondary"
            title={`Underlyings Input`}
            quantity={inputs.secondary}
            onChange={handleInputChange}
            onClick={() => console.log('Max unavailable.')} //
            balance={underlyingAmount}
          />{' '}
        </>
      )}

      <Spacer />
      <LineItem
        label="This requires"
        data={`${calculateOutput()}`}
        units={`${item.asset.toUpperCase()}`}
      />
      <Spacer />
      <LineItem
        label="Implied Option Price"
        data={`${calculateImpliedPrice()}`}
        units={`${item.asset.toUpperCase()}`}
      />
      <Spacer />
      <LineItem
        label="You will receive"
        data={caculatePoolShare()}
        units={`% of the Pool.`}
      />
      <Spacer />
      <IconButton
        text="Advanced"
        variant="transparent"
        onClick={() => setAdvanced(!advanced)}
      >
        {advanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
      <Spacer />

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
        {approved ? (
          <> </>
        ) : (
          <>
            <Button
              disabled={!tokenAllowance || submitting}
              full
              size="sm"
              onClick={handleApproval}
              isLoading={submitting}
              text={`Approve ${item.asset.toUpperCase()}`}
            />
          </>
        )}

        <Button
          disabled={!approved || !inputs || submitting}
          full
          size="sm"
          onClick={handleSubmitClick}
          isLoading={submitting}
          text="Review Transaction"
        />
      </Box>
    </>
  )
}

const StyledText = styled.h5`
  color: ${(props) => props.theme.color.white};
  display: flex;
  font-size: 16px;
  font-weight: 500;
  margin: ${(props) => props.theme.spacing[2]}px;
`
const StyledTitle = styled.h5`
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px;
`
const StyledSubtitle = styled.h5`
  color: ${(props) => props.theme.color.white};
  font-size: 16px;
  font-weight: 500;
  margin: ${(props) => props.theme.spacing[2]}px;
`

export default AddLiquidity
