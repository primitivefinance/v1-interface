import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'

// Components
import Box from '@/components/Box'
import Button from '@/components/Button'
import LineItem from '@/components/LineItem'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'

// Utilities
import { sign } from 'crypto'
import { Operation, SignitureData } from '@primitivefi/sdk'
import { BigNumber } from 'ethers'
import { parseEther, formatEther, parseUnits } from 'ethers/lib/utils'
import isZero from '@/utils/isZero'

// Hooks
import { usePermit, useDAIPermit } from '@/hooks/transactions/usePermit'
import useApprove from '@/hooks/transactions/useApprove'
import useTokenAllowance from '@/hooks/useTokenAllowance'
import useBalance from '@/hooks/useBalance'
import useTokenBalance from '@/hooks/useTokenBalance'
import useTokenTotalSupply from '@/hooks/useTokenTotalSupply'
import { useItem, useHandleSubmitOrder } from '@/state/order/hooks'
import { useWeb3React } from '@web3-react/core'
import { TokenAmount, Fraction, Rounding } from '@sushiswap/sdk'
import { useAddNotif } from '@/state/notifs/hooks'
import { tryParseAmount } from '@/utils/index'
import { useLiquidityActionHandlers, useLP } from '@/state/liquidity/hooks'

// SDK Utils
import {
  Trade,
  SushiSwapMarket,
  Venue,
  PRIMITIVE_ROUTER,
} from '@primitivefi/sdk'

const AddLiquidity: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  // web3
  const { library, chainId } = useWeb3React()
  // approval
  const onApprove = useApprove()
  const handlePermit = usePermit()
  const handleDAIPermit = useDAIPermit()
  // notifs
  const addNotif = useAddNotif()
  // option entity in order
  const { item, orderType, loading, approved } = useItem()
  // inputs for user quantity
  const { optionValue, underlyingValue } = useLP()
  const { onOptionInput, onUnderInput } = useLiquidityActionHandlers()
  const parsedOptionAmount = tryParseAmount(optionValue)
  const parsedUnderlyingAmount = tryParseAmount(underlyingValue)
  // set null lp
  const [hasLiquidity, setHasL] = useState(false)
  const [signData, setSignData] = useState<SignitureData>(null)

  // pair and option entities
  const entity = item.entity
  // has liquidity?
  useEffect(() => {
    if (item.market) {
      setHasL(item.market.hasLiquidity)
    }
  }, [setHasL, item])

  const lpToken = item.market ? item.market.liquidityToken.address : ''
  const underlyingTokenBalance = entity.isWethCall
    ? useBalance()
    : useTokenBalance(entity.underlying.address)
  const lp = useTokenBalance(lpToken)
  const lpTotalSupply = useTokenTotalSupply(lpToken)

  // allowance
  const isUniswap = item.venue === Venue.UNISWAP ? true : false
  const spender = isUniswap
    ? PRIMITIVE_ROUTER[chainId].address
    : PRIMITIVE_ROUTER[chainId].address
  const tokenAllowance = useTokenAllowance(entity.underlying.address, spender)

  // ==== Input Handling ====
  const handleOptionInput = useCallback(
    (value: string) => {
      onOptionInput(value)
      if (hasLiquidity) {
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
    [onOptionInput, onUnderInput]
  )
  const handleUnderInput = useCallback(
    (value: string) => {
      /* if (value === '') {
        value = '0'
      } */
      onUnderInput(value)
      if (hasLiquidity) {
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
    [onUnderInput, onOptionInput]
  )

  const handleSetMax = useCallback(() => {
    if (parseEther(underlyingTokenBalance).lt(parseUnits('1', 'gwei'))) {
      return null
    }
    const underlyingFraction = new Fraction(
      parseEther(underlyingTokenBalance).toString()
    )
    const smallAmount = new Fraction(parseUnits('1', 6).toString())
    onUnderInput(
      formatEther(
        underlyingFraction.toSignificant(
          12,
          { groupSeparator: '' },
          Rounding.ROUND_DOWN
        )
        /* new Fraction(
          underlyingFraction.toSignificant(
            12,
            { groupSeparator: '' },
            Rounding.ROUND_DOWN
          )
        )
          .subtract(smallAmount)
          .toSignificant(12, { groupSeparator: '' }, Rounding.ROUND_DOWN) */
      )
    )
  }, [underlyingTokenBalance, onUnderInput])

  // ==== Transaction Handling ====
  const handleApproval = useCallback(() => {
    const approveAmount = hasLiquidity
      ? underlyingValue
      : BigNumber.from(underlyingValue).add(optionValue).toString()
    if (item.entity.isCall) {
      onApprove(entity.underlying.address, spender, approveAmount)
        .then()
        .catch((error) => {
          addNotif(
            0,
            `Approving ${entity.underlying.symbol.toUpperCase()}`,
            error.message,
            ''
          )
        })
    } else if (item.entity.isPut) {
      handleDAIPermit(spender)
        .then((data) => {
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
    } else {
      handlePermit(entity.underlying.address, spender, approveAmount)
        .then((data) => {
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
    }
  }, [
    entity.underlying,
    onApprove,
    underlyingValue,
    setSignData,
    handleDAIPermit,
    handlePermit,
  ])

  const isApproved = useCallback(() => {
    if (item.entity.isCall) {
      return approved[0]
    } else if (item.entity.isWethCall) {
      return true
    } else {
      return approved[0] || signData
    }
  }, [approved, item.entity, signData])

  const handleSubmitClick = useCallback(() => {
    if (hasLiquidity) {
      submitOrder(
        library,
        BigInt(parsedUnderlyingAmount.toString()),
        orderType,
        BigInt(parsedUnderlyingAmount.toString()),
        signData
      )
    } else {
      submitOrder(
        library,
        BigInt(parsedOptionAmount.toString()),
        orderType,
        BigInt(parsedUnderlyingAmount.toString()),
        signData
      )
    }
  }, [
    submitOrder,
    item,
    library,
    parsedOptionAmount,
    parsedUnderlyingAmount,
    orderType,
    signData,
  ])

  // ==== Information Calculation Handling ====

  // the quantity of options supplied as liquidity for the 'pile-on' order type is not equal to the parsed amount input.
  // optionsAdded = totalUnderlyingTokensAdded (parsed amount sum) / (strikeRatio * reserveB / reserveA + 1)
  const calculateOptionsAddedAsLiquidity = useCallback(() => {
    // The total deposit amount
    const parsedTotalUnderlying = hasLiquidity
      ? parsedUnderlyingAmount // primary input if has liquidity
      : parsedOptionAmount // secondary input if initializing liquidity

    if (
      typeof item.market === 'undefined' ||
      item.market === null ||
      typeof parsedTotalUnderlying === 'undefined' ||
      BigNumber.from(parseEther(lpTotalSupply)).isZero() ||
      BigNumber.from(parsedTotalUnderlying).isZero()
    ) {
      return parsedTotalUnderlying || '0'
    }

    // The total underlying deposit token amount.
    const inputAmount = new TokenAmount(
      entity.underlying,
      parsedTotalUnderlying.toString()
    )

    // quote / base * uBase / rQuote = u / r + 1 -> priceOf(u)
    const denominator = BigNumber.from(entity.quoteValue.raw.toString())
      .mul(parseEther('1'))
      .div(entity.baseValue.raw.toString())
      .mul(item.market.reserveOf(entity.underlying).raw.toString())
      .div(item.market.reserveOf(entity.redeem).raw.toString())
      .add(parseEther('1'))
    // the quantity of options that will be added to the pool (which will be used to calculate the short options),
    // which will be minted from the total underlying deposit.
    // the remainder underlying deposit will be added to the pool as liquidity.
    const optionsInput = BigNumber.from(inputAmount.raw.toString()) // IN UNITS OF BASE VALUE
      .mul(parseEther('1'))
      .div(denominator)

    return optionsInput.toString()
  }, [item.market, lpTotalSupply, parsedOptionAmount, parsedUnderlyingAmount])

  const calculatePoolShare = useCallback(() => {
    const none = '0'
    const parsedSupply = parseEther(lpTotalSupply)
    if (
      typeof item.market === 'undefined' ||
      item.market === null ||
      parsedSupply.isZero()
    )
      return none

    const tokenSupplyAmount = new TokenAmount(
      item.market.liquidityToken,
      parsedSupply.toString()
    )
    // quantity of long option tokens that are minted. UNITS OF BASE VALUE
    const optionsInput = calculateOptionsAddedAsLiquidity().toString()

    // Quantity of short option tokens added to pool. IN UNITS OF QUOTE VALUE
    const amountADesired = new TokenAmount(
      entity.redeem,
      entity.proportionalShort(optionsInput).toString()
    )
    // Quantity of underlying added based on the prortional amount of short options added
    const amountBDesired = new TokenAmount(
      entity.underlying,
      Trade.getQuote(
        amountADesired.raw.toString(),
        item.market.reserveOf(amountADesired.token).raw.toString(),
        item.market.reserveOf(entity.underlying).raw.toString()
      ).toString()
    )

    console.log(`
      optionsInput: ${formatEther(optionsInput)}
      amountADesired: ${formatEther(amountADesired.raw.toString())}
      amountBDesired: ${formatEther(amountBDesired.raw.toString())}
    `)

    if (
      isZero(amountADesired.raw.toString()) ||
      isZero(amountBDesired.raw.toString())
    ) {
      return none
    }

    const lpMinted = item.market.getLiquidityMinted(
      tokenSupplyAmount,
      amountADesired, // short option tokens added
      amountBDesired // underlying tokens added
    )
    const poolShare = parsedSupply.gt(0)
      ? BigNumber.from(lpMinted.raw.toString())
          .mul(parseEther('1'))
          .div(
            BigNumber.from(tokenSupplyAmount.raw.toString()).add(
              lpMinted.raw.toString()
            )
          )
      : parseEther('0')

    const addedPoolShare = formatEther(poolShare.mul('100'))
    return addedPoolShare
  }, [
    item.market,
    lp,
    lpTotalSupply,
    parsedOptionAmount,
    parsedUnderlyingAmount,
    calculateOptionsAddedAsLiquidity,
  ])

  const getPutMultiplier = useCallback(() => {
    const multiplier = entity.isPut
      ? BigNumber.from(entity.baseValue.raw.toString())
      : parseEther('1')
    return multiplier
  }, [item, entity.isPut, parsedOptionAmount])

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
      const tempMarket = new SushiSwapMarket(
        entity,
        redeemAmount,
        underlyingAmount
      )
      return formatEther(
        getPutMultiplier()
          .mul(tempMarket.spotOpenPremium.raw.toString())
          .div(parseEther('1'))
      )
    }
    return formatEther(
      getPutMultiplier()
        .mul(item.market.spotOpenPremium.raw.toString())
        .div(parseEther('1'))
    )
  }, [
    item.market,
    lp,
    lpTotalSupply,
    parsedOptionAmount,
    parsedUnderlyingAmount,
  ])

  const underlyingAssetSymbol = useCallback(() => {
    const symbol = entity.isPut
      ? 'DAI'
      : entity.isWethCall
      ? 'ETH '
      : item.asset.toUpperCase()
    return symbol === '' ? entity.underlying.symbol.toUpperCase() : symbol
  }, [item])

  // ==== Title for no liquidity ====

  const noLiquidityTitle = {
    text:
      'This pair has no liquidity, adding liquidity will initialize this market and set an initial token ratio. The Long input should be greater than the underlying input.',
    tip:
      'Providing liquidity to this pair will set the ratio between the tokens. Total deposit of underlying tokens is the sum of the inputs.',
  }

  return (
    <LiquidityContainer>
      <Spacer size="sm" />
      {hasLiquidity ? (
        <PriceInput
          name="primary"
          title={underlyingAssetSymbol()}
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
            title={entity.isCall ? 'Call Options' : 'Put Options'}
            quantity={optionValue}
            onChange={handleOptionInput}
            onClick={() => {}}
            tip={
              'The quantity of options that will be minted. Long and short option tokens are minted, and the short option tokens get provided as liquidity'
            }
          />
          <Spacer />
          <PriceInput
            name="secondary"
            title={underlyingAssetSymbol()}
            quantity={underlyingValue}
            onChange={handleUnderInput}
            onClick={() => {}}
            tip={`The quantity of ${underlyingAssetSymbol()} that will be added to the pool as liquidity.`}
          />
        </>
      )}
      <Spacer />
      <LineItem
        label="Total Deposit"
        data={formatEther(
          hasLiquidity
            ? parsedUnderlyingAmount
            : parsedUnderlyingAmount.add(parsedOptionAmount)
        )}
        units={underlyingAssetSymbol()}
      />
      <Spacer size="sm" />
      {!hasLiquidity ? (
        <>
          {item.entity.isPut ? (
            <>
              <LineItem
                label="Put multiplier"
                data={'2'}
                units={'x'}
                tip="Each put option token gives the owner the right to purchase 1 Dai. The price of a full option is the price per put multiplied by the strike price."
              />
              <Spacer size="sm" />
            </>
          ) : (
            <> </>
          )}
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
        data={!hasLiquidity ? '100' : calculatePoolShare()}
        units={`% of Pool`}
      />

      <Spacer size="sm" />
      <Box row justifyContent="flex-start">
        {loading ? (
          <div style={{ width: '100%' }}>
            <Box column alignItems="center" justifyContent="center">
              <Button
                disabled={true}
                isLoading={true}
                variant="secondary"
                full
                size="sm"
                onClick={() => {}}
                text={`Add Liquidity`}
              />
            </Box>
          </div>
        ) : (
          <>
            {isApproved() ? (
              <> </>
            ) : (
              <>
                <Button
                  disabled={parsedUnderlyingAmount.isZero()}
                  full
                  size="sm"
                  onClick={handleApproval}
                  text={`Approve ${entity.underlying.symbol.toUpperCase()}`}
                />
              </>
            )}

            <Button
              disabled={
                !isApproved() ||
                !parsedUnderlyingAmount?.gt(0) ||
                (hasLiquidity ? null : !parsedOptionAmount?.gt(0))
              }
              full
              size="sm"
              onClick={handleSubmitClick}
              text={`Add Liquidity`}
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
