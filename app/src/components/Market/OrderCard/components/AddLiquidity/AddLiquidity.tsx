import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import ethers from 'ethers'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import Loader from '@/components/Loader'
import LineItem from '@/components/LineItem'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'
import Tooltip from '@/components/Tooltip'
import WarningLabel from '@/components/WarningLabel'
import { Operation, UNISWAP_CONNECTOR } from '@/constants/index'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'

import { useReserves } from '@/hooks/data'
import useApprove from '@/hooks/transactions/useApprove'
import useTokenAllowance from '@/hooks/useTokenAllowance'
import useTokenBalance from '@/hooks/useTokenBalance'
import useTokenTotalSupply from '@/hooks/useTokenTotalSupply'
import useGuardCap from '@/hooks/transactions/useGuardCap'

import { Trade } from '@/lib/entities/trade'
import { UNISWAP_ROUTER02_V2 } from '@/lib/constants'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import AddIcon from '@material-ui/icons/Add'

import {
  useItem,
  useUpdateItem,
  useHandleSubmitOrder,
  useRemoveItem,
} from '@/state/order/hooks'

import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount } from '@uniswap/sdk'
import { useAddNotif } from '@/state/notifs/hooks'

import formatEtherBalance from '@/utils/formatEtherBalance'
import App from '../../../../../pages/_app'

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
  const { item, orderType, approved, loading } = useItem()
  // inputs for user quantity
  const [inputs, setInputs] = useState({
    primary: '',
    secondary: '',
  })
  // set null lp
  const [hasLiquidity, setHasL] = useState(false)
  // web3
  const { library, chainId } = useWeb3React()
  // approval
  const addNotif = useAddNotif()
  // guard cap
  const guardCap = useGuardCap(item.asset, orderType)
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

  useEffect(() => {
    if (lpPair) {
      console.log(lpPair.reserveOf(shortToken).numerator[0])
      setHasL(lpPair.reserveOf(shortToken).numerator[0] > 10000)
    }
  }, [setHasL, lpPair])

  const lpToken = lpPair ? lpPair.liquidityToken.address : ''
  const token0 = lpPair ? lpPair.token0.symbol : ''
  const token1 = lpPair ? lpPair.token1.symbol : ''
  const underlyingTokenBalance = useTokenBalance(underlyingToken.address)
  const optionTokenBalance = useTokenBalance(item.address)
  const lp = useTokenBalance(lpToken)
  const lpTotalSupply = useTokenTotalSupply(lpToken)
  const spender = UNISWAP_CONNECTOR[chainId]
  const tokenAllowance = useTokenAllowance(
    item.entity.assetAddresses[0],
    spender
  )
  const { onApprove } = useApprove(underlyingToken.address, spender)

  const underlyingAmount: TokenAmount = new TokenAmount(
    underlyingToken,
    parseEther(underlyingTokenBalance).toString()
  )

  const handleInputChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setInputs({
        ...inputs,
        [e.currentTarget.name]: e.currentTarget.value,
      })
    },
    [setInputs, inputs]
  )

  // FIX
  const handleSetMax = () => {
    const max = Math.round(
      ((+underlyingTokenBalance + Number.EPSILON) * 100) / 100
    )
    setInputs({
      ...inputs,
      secondary: parseFloat(underlyingTokenBalance).toFixed(10).toString(),
    })
  }

  const handleSubmitClick = useCallback(() => {
    const imp = BigInt(
      parseInt((parseFloat(inputs.primary) * 100).toString()) * 1000000000000000
    )

    const sec =
      inputs.secondary === ''
        ? BigInt(0)
        : BigInt(
            parseInt((parseFloat(inputs.secondary) * 100).toString()) *
              1000000000000000
          )
    console.log(imp)
    console.log(sec)
    submitOrder(library, item?.address, imp, orderType, sec)
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

  const calculatePoolShare = useCallback(() => {
    const inputValue =
      parseFloat(inputs.primary) > 0
        ? BigNumber.from(
            BigInt(parseFloat(inputs.primary).toString()).toString()
          )
        : BigNumber.from('0')
    const supply = BigNumber.from(parseEther(lpTotalSupply).toString())
    if (typeof lpPair === 'undefined' || lpPair === null) return '0'
    const poolShare =
      supply.gt(0) && inputValue.gt(0)
        ? Number(parseInt(supply.div(inputValue.mul(100000)).toString()))
        : 0

    return 0
  }, [lpPair, lp, lpTotalSupply, inputs])

  const calculateOutput = useCallback(() => {
    if (typeof lpPair === 'undefined' || lpPair === null) {
      const input =
        inputs.primary !== ''
          ? parseEther(parseFloat(inputs.primary).toString())
          : parseEther('0')
      const output =
        inputs.secondary !== ''
          ? parseEther(parseFloat(inputs.secondary).toString())
          : parseEther('0')
      const sum = BigNumber.from(output).add(input)
      return formatEther(sum.toString())
    }
    const reservesA = lpPair.reserveOf(
      new Token(chainId, item.entity.assetAddresses[2], 18)
    )
    const reservesB = lpPair.reserveOf(
      new Token(chainId, item.entity.assetAddresses[0], 18)
    )
    const inputShort = parseEther(calculateInput()) // pair has short tokens, so need to convert our desired options to short options
      .mul(item.entity.optionParameters.quote.quantity)
      .div(item.entity.optionParameters.base.quantity)
    const quote = Trade.getQuote(
      inputShort,
      reservesA.raw.toString(),
      reservesB.raw.toString()
    )
    const sum = BigNumber.from(quote).add(parseEther(calculateInput()))
    return formatEther(sum.toString())
  }, [lpPair, lp, lpTotalSupply, inputs])

  const calculateInput = useCallback(() => {
    if (typeof lpPair === 'undefined' || lpPair === null) {
      const input =
        inputs.primary !== ''
          ? parseEther(parseFloat(inputs.primary).toString())
          : BigNumber.from('0')
      const output =
        inputs.secondary !== ''
          ? parseEther(parseFloat(inputs.secondary).toString())
          : BigNumber.from('0')
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
      inputs.primary !== ''
        ? parseEther(parseFloat(inputs.primary).toString())
        : BigNumber.from('0')
    const ratio = parseEther('1')
      .mul(item.entity.optionParameters.quote.quantity)
      .div(item.entity.optionParameters.base.quantity)
    const denominator = ratio
      .mul(reservesB.raw.toString())
      .div(reservesA.raw.toString())
      .add(parseEther('1'))
    const optionsInput = input.mul(parseEther('1')).div(denominator)
    return formatEther(optionsInput.toString())
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
      new TokenAmount(
        lpPair.liquidityToken,
        parseEther(lpTotalSupply).mul(1).div(100).toString() // 1%
      )
    )

    const underlyingValue = lpPair.getLiquidityValue(
      UNDERLYING,
      new TokenAmount(
        lpPair.liquidityToken,
        parseEther(lpTotalSupply).toString()
      ),
      new TokenAmount(
        lpPair.liquidityToken,
        parseEther(lpTotalSupply).mul(1).div(100).toString()
      )
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
    if (typeof lpPair === 'undefined' || lpPair === null || !hasLiquidity) {
      const input =
        inputs.primary !== ''
          ? parseEther(parseFloat(inputs.primary).toString())
          : parseEther('0')

      console.log(input)
      const inputShort = BigNumber.from(input) // pair has short tokens, so need to convert our desired options to short options
        .mul(item.entity.optionParameters.quote.quantity)
        .div(item.entity.optionParameters.base.quantity)
      console.log(inputShort)
      const output =
        inputs.secondary !== ''
          ? parseEther(parseFloat(inputs.secondary).toString())
          : parseEther('0')
      console.log(output)
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
      item.entity.optionParameters.base.quantity,
      item.entity.optionParameters.quote.quantity,
      path,
      [reservesA.raw.toString(), reservesB.raw.toString()]
    )
    return formatEther(quote.toString())
  }, [lpPair, lp, lpTotalSupply, inputs])

  const isAboveGuardCap = useCallback(() => {
    const inputValue =
      inputs.secondary !== ''
        ? parseEther(inputs.secondary.toString())
        : parseEther('0')
    return inputValue.gt(guardCap)
  }, [inputs, guardCap])

  const handleApproval = useCallback(() => {
    onApprove()
      .then()
      .catch((error) => {
        addNotif(
          0,
          `Approving ${underlyingToken.symbol.toUpperCase()}`,
          error.message,
          ''
        )
      })
  }, [inputs, tokenAllowance, onApprove])

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
      <Spacer size="sm" />
      {hasLiquidity ? (
        <PriceInput
          name="primary"
          title={`Underlying Input`}
          quantity={inputs.primary}
          onChange={handleInputChange}
          onClick={handleSetMax}
          balance={
            new TokenAmount(
              underlyingToken,
              parseEther(underlyingTokenBalance).toString()
            )
          }
          valid={parseEther(underlyingTokenBalance).gt(
            parseEther(inputs.primary.toString() || '0')
          )}
        />
      ) : (
        <>
          <StyledSubtitle>
            <Tooltip text={noLiquidityTitle.tip}>
              {noLiquidityTitle.text}
            </Tooltip>
          </StyledSubtitle>
          <Spacer size="sm" />
          <PriceInput
            name="primary"
            title={`Options Input`}
            quantity={inputs.primary}
            onChange={handleInputChange}
            onClick={() => console.log('Max unavailable.')} //
          />
          <PriceInput
            name="secondary"
            title={`Underlyings Input`}
            quantity={inputs.secondary}
            onChange={handleInputChange}
            onClick={() => console.log('Max unavailable.')} //
            balance={underlyingAmount}
          />
        </>
      )}

      <Spacer />
      <LineItem label="LP for" data={`${calculateInput()}`} units={`Options`} />
      <Spacer size="sm" />
      {!hasLiquidity ? (
        <>
          <LineItem
            label="Implied Option Price"
            data={`${calculateImpliedPrice()}`}
            units={`${underlyingToken.symbol.toUpperCase()}`}
          />
          <Spacer size="sm" />{' '}
        </>
      ) : (
        <></>
      )}

      {hasLiquidity ? (
        <>
          <LineItem
            label="You will receive"
            data={calculatePoolShare()}
            units={`% of the Pool.`}
          />
          <Spacer size="sm" />
          <IconButton
            text="Advanced"
            variant="transparent"
            onClick={() => setAdvanced(!advanced)}
          >
            {advanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </>
      ) : null}

      <Spacer size="sm" />

      {advanced && hasLiquidity ? (
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
            label={`Total ${underlyingToken.symbol.toUpperCase()} per LP Token`}
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
            data={calculatePoolShare()}
            units={`%`}
          />
          <Spacer />
        </>
      ) : (
        <> </>
      )}
      {isAboveGuardCap() ? (
        <>
          <div style={{ marginTop: '-.5em' }} />
          <WarningLabel>
            This amount of underlying tokens is above our guardrail cap of
            $150,000
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
            {approved ? (
              <> </>
            ) : (
              <>
                <Button
                  disabled={submitting}
                  full
                  size="sm"
                  onClick={handleApproval}
                  isLoading={submitting}
                  text={`Approve ${underlyingToken.symbol.toUpperCase()}`}
                />
              </>
            )}

            <Button
              disabled={
                !approved ||
                !inputs.primary ||
                (hasLiquidity ? null : !inputs.secondary) ||
                submitting ||
                isAboveGuardCap()
              }
              full
              size="sm"
              onClick={handleSubmitClick}
              isLoading={submitting}
              text={isAboveGuardCap() ? 'Above Cap' : 'Confirm Transaction'}
            />
          </>
        )}
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
