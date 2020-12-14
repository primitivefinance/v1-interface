import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'

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
import { Fraction } from '@uniswap/sdk'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import isZero from '@/utils/isZero'

import {
  useItem,
  useUpdateItem,
  useHandleSubmitOrder,
  useRemoveItem,
} from '@/state/order/hooks'

import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount } from '@uniswap/sdk'
import { useAddNotif } from '@/state/notifs/hooks'
import {
  useLiquidityActionHandlers,
  useLP,
  tryParseAmount,
} from '@/state/liquidity/hooks'

const AddLiquidity: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  const removeItem = useRemoveItem()
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
  const guardCap = useGuardCap(item.asset, orderType)
  // pair and option entities
  const entity = item.entity
  // has liquidity?
  useEffect(() => {
    if (item.market) {
      setHasL(item.market.reserveOf(entity.redeem).numerator[2])
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
    },
    [onOptionInput]
  )
  const handleUnderInput = useCallback(
    (value: string) => {
      onUnderInput(value)
    },
    [onUnderInput]
  )
  // FIX

  const handleSetMax = useCallback(() => {
    underlyingTokenBalance && onUnderInput(underlyingTokenBalance)
  }, [underlyingTokenBalance, onUnderInput])

  const handleSubmitClick = useCallback(() => {
    submitOrder(
      library,
      BigInt(parsedOptionAmount.toString()),
      orderType,
      BigInt(parsedUnderlyingAmount.toString())
    )
    removeItem()
  }, [
    submitOrder,
    removeItem,
    item,
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
    if (
      typeof item.market === 'undefined' ||
      item.market === null ||
      typeof parsedOptionAmount === 'undefined'
    ) {
      return parsedOptionAmount || '0'
    }
    const inputAmount = new TokenAmount(
      entity.underlying,
      parsedOptionAmount.toString()
    )
    return item.market.getOptionsAddedAsLiquidity(inputAmount).raw.toString()
  }, [item.market, lp, lpTotalSupply, parsedOptionAmount])

  const calculatePoolShare = useCallback(() => {
    const supply = BigNumber.from(parseEther(lpTotalSupply).toString())
    if (
      typeof item.market === 'undefined' ||
      item.market === null ||
      parsedOptionAmount.toString() === '0'
    )
      return 0
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
      return '0'
    }
    const tokenAmountA = new TokenAmount(entity.underlying, amountADesired)
    const tokenAmountB = new TokenAmount(entity.redeem, amountBDesired)
    const lpMinted = item.market.getLiquidityMinted(
      tSupply,
      tokenAmountA,
      tokenAmountB
    )
    const poolShare =
      supply.gt(0) && parsedOptionAmount.gt(0)
        ? lpMinted.divide(tSupply.add(lpMinted))
        : new Fraction('0')

    return poolShare.multiply('100').toSignificant(6)
  }, [
    item.market,
    lpTotalSupply,
    parsedOptionAmount,
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
      const inputShort = entity.proportionalShort(parsedOptionAmount) // pair has short tokens, so need to convert our desired options to short options))
      const path = [entity.redeem.address, entity.underlying.address]
      const quote = Trade.getSpotPremium(
        entity.baseValue.raw.toString(),
        entity.quoteValue.raw.toString(),
        path,
        [inputShort, parsedUnderlyingAmount]
      )
      return formatEther(quote.toString())
    }
    return formatEther(item.market.spotOpenPremium.raw.toString())
  }, [
    item.market,
    lp,
    lpTotalSupply,
    parsedOptionAmount,
    parsedUnderlyingAmount,
  ])

  const isAboveGuardCap = useCallback(() => {
    const inputValue = parsedUnderlyingAmount
    return inputValue ? inputValue.gt(guardCap) && chainId === 1 : false
  }, [parsedUnderlyingAmount, guardCap])

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
      {hasLiquidity ? (
        <StyledTabs selectedIndex={tab} onSelect={(index) => setTab(index)}>
          <StyledTabList>
            <StyledTab active={tab === 0}>
              <Tooltip
                text={
                  'Add underlying to the liquidity pool at the current premium'
                }
              >
                Pile-On
              </Tooltip>
            </StyledTab>
            <StyledTab active={tab === 1}>
              <Tooltip text={'Add liquidity at a custom ratio'}>
                Set Ratio
              </Tooltip>
            </StyledTab>
          </StyledTabList>
          <StyledTabPanel>
            <PriceInput
              name="primary"
              title={`Underlying Input`}
              quantity={optionValue}
              onChange={handleOptionInput}
              onClick={handleSetMax}
              balance={
                new TokenAmount(
                  entity.underlying,
                  parseEther(underlyingTokenBalance).toString()
                )
              }
              valid={parseEther(underlyingTokenBalance).gt(
                parsedUnderlyingAmount
              )}
            />
          </StyledTabPanel>
          <StyledTabPanel>
            <PriceInput
              name="primary"
              title={`SHORT Input`}
              quantity={optionValue}
              onChange={handleOptionInput}
              onClick={() => console.log('Max unavailable.')} //
              balance={shortAmount}
            />
            <Spacer size="sm" />
            <PriceInput
              name="secondary"
              title={`Underlying Input`}
              quantity={underlyingValue}
              onChange={handleUnderInput}
              onClick={handleSetMax}
              balance={underlyingAmount}
            />
          </StyledTabPanel>
        </StyledTabs>
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
            title={`LONG Input`}
            quantity={optionValue}
            onChange={handleOptionInput}
            onClick={() => console.log('Max unavailable.')} //
          />
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

      {hasLiquidity ? (
        <>
          <LineItem
            label="Receive"
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

      {advanced && hasLiquidity ? (
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
                (hasLiquidity ? null : !parsedUnderlyingAmount?.gt(0)) ||
                (hasLiquidity ? null : !parsedOptionAmount?.gt(0)) ||
                isAboveGuardCap()
              }
              full
              size="sm"
              onClick={handleSubmitClick}
              text={isAboveGuardCap() ? 'Above Cap' : 'Confirm Transaction'}
            />
          </>
        )}
      </Box>
    </>
  )
}
interface TabProps {
  active?: boolean
}
const StyledTabPanel = styled(TabPanel)``
const StyledTab = styled(Tab)<TabProps>`
  background-color: ${(props) =>
    !props.active ? props.theme.color.grey[800] : props.theme.color.black};
  color: ${(props) => props.theme.color.white};
  font-weight: ${(props) => (props.active ? 600 : 500)};
  padding: 0.5em 0.5em 0.5em 1em;
  border-radius: 0.3em 0.3em 0 0;
  border-width: 1px 1px 0 1px;
  border-style: solid;
  border-color: ${(props) => props.theme.color.grey[600]};
  width: 50%;
  list-style: none;
  cursor: pointer;
`
const StyledTabList = styled(TabList)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: baseline;
  margin-left: -2.5em;
`
const StyledTabs = styled(Tabs)`
  width: 100%;
`
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
