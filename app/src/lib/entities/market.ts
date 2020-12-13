import { Token, TokenAmount, Pair, Fraction } from '@uniswap/sdk'
import ethers, { BigNumber, BigNumberish } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { Option } from './option'
import isZero from '@/utils/isZero'
import { Operation } from '@/constants/index'

export class Market extends Pair {
  public readonly option: Option
  public constructor(
    option: Option,
    tokenAmountA: TokenAmount,
    tokenAmountB: TokenAmount
  ) {
    super(tokenAmountA, tokenAmountB)
    this.option = option
  }

  public get FEE(): BigNumberish {
    return 301
  }

  public get FEE_UNITS(): BigNumberish {
    return 100000
  }

  /**
   * @dev Gets the quantity of longOptionTokens which can be purchased with less than 2% slippage.
   */
  public get depth(): TokenAmount {
    const underlyingReserve: TokenAmount = this.reserveOf(
      this.option.underlying
    )
    const twoPercentOfReserve: BigNumber = BigNumber.from(
      underlyingReserve.raw.toString()
    )
      .mul(2)
      .div(100)

    let redeemCost: TokenAmount
    let newPair: Pair
    if (!twoPercentOfReserve.eq('0') && underlyingReserve.numerator[2]) {
      ;[redeemCost, newPair] = this.getInputAmount(
        new TokenAmount(this.option.underlying, twoPercentOfReserve.toString())
      )
    } else {
      redeemCost = new TokenAmount(this.option.redeem, '0')
    }

    const redeemCostDivMinted = BigNumber.from(redeemCost.raw.toString()).div(
      this.option.quoteValue.raw.toString()
    )

    return new TokenAmount(this.option, redeemCostDivMinted.toString())
  }

  /**
   * @dev Gets the cost to purchase `outputAmount` of longOptionTokens, denominated in underlyingTokens.
   * @param outputAmount The quantity of longOptionTokens to purchase (also the quantity of underlyingTokens borrowed).
   */
  public getOpenPremium = (outputAmount: TokenAmount): TokenAmount => {
    if (
      typeof this.reserveOf(this.option.redeem).numerator[2] === 'undefined'
    ) {
      return new TokenAmount(this.option.underlying, '0')
    }

    const redeemPayment = this.option.proportionalShort(
      outputAmount.raw.toString()
    )
    const [amountIn, newPair] = this.getInputAmount(outputAmount)
    const costRedeem = BigNumber.from(amountIn.raw.toString()).gt(redeemPayment)
      ? BigNumber.from(amountIn.raw.toString()).sub(redeemPayment)
      : parseEther('0')
    const costUnderlying = costRedeem.gt(0)
      ? this.getOutputAmount(
          new TokenAmount(this.option.redeem, costRedeem.toString())
        )[0]
      : new TokenAmount(this.option.redeem, '0')
    const premium = BigNumber.from(costUnderlying.raw.toString())
      .mul(this.FEE_UNITS)
      .add(BigNumber.from(costUnderlying.raw.toString()).mul(this.FEE))
      .div(this.FEE_UNITS)
    return new TokenAmount(this.option.underlying, premium.toString())
  }

  public get spotOpenPremium(): TokenAmount {
    return new TokenAmount(
      this.option.underlying,
      this.getOpenPremium(this.option.baseValue)
        .multiply(parseEther('1').toString())
        .divide(this.option.baseValue)
        .toSignificant(6)
    )
  }

  /**
   * @dev Gets the payout for selling the proprotional longOptionToken amount of `outputAmount`.
   * @param outputAmount The quantity of shortOptionTokens per optionToken that needs to be closed.
   */
  public getClosePremium = (outputAmount: TokenAmount): TokenAmount => {
    if (!this.reserveOf(this.option.redeem).numerator[2]) {
      return new TokenAmount(this.option.underlying, '0')
    }
    const underlyingsMinted = this.option.proportionalLong(
      outputAmount.raw.toString()
    )
    const [amountIn, newPair] = this.getInputAmount(outputAmount)
    const payout = underlyingsMinted.gt(amountIn.raw.toString())
      ? underlyingsMinted.sub(amountIn.raw.toString())
      : parseEther('0')
    return new TokenAmount(this.option.underlying, payout.toString())
  }

  public get spotClosePremium(): TokenAmount {
    return new TokenAmount(
      this.option.underlying,
      this.getClosePremium(
        new TokenAmount(
          this.option.redeem,
          this.option.quoteValue.raw.toString()
        )
      )
        .multiply(parseEther('1').toString())
        .divide(this.option.baseValue)
        .toSignificant(6)
    )
  }

  /**
   * @dev Gets the cost to purchase `inputAmount` of shortOptionTokens, denominated in underlyingTokens.
   * @param inputAmount Quantity of shortOptionTokens to purchase.
   */
  public getShortPremium = (inputAmount: TokenAmount): TokenAmount => {
    if (!this.reserveOf(this.option.redeem).numerator[2]) {
      return new TokenAmount(this.option.underlying, '0')
    }

    const [amountOut, newPair] = this.getOutputAmount(inputAmount)
    return amountOut
  }

  public get spotShortPremium(): TokenAmount {
    return new TokenAmount(
      this.option.underlying,
      parseEther(
        this.priceOf(this.option.redeem).raw.toSignificant(6)
      ).toString()
    )
  }

  /**
   * @dev Gets the spot price, actual execution price, and slippage based on the spot * size product.
   * @param orderType The order type which will be executed.
   * @param inputAmount The size of the order.
   * @returns Spot, Actual, Slippage
   */
  public getExecutionPrice = (
    orderType: Operation,
    inputAmount: BigNumberish
  ): [TokenAmount, TokenAmount, number] => {
    let parsedAmount: TokenAmount
    let spot: TokenAmount
    let actualPremium: TokenAmount
    let slippage: number
    if (orderType === Operation.LONG) {
      parsedAmount = new TokenAmount(
        this.option.underlying,
        inputAmount.toString()
      )
      spot = this.spotOpenPremium
      actualPremium = this.getOpenPremium(parsedAmount)
      const spotSize = BigNumber.from(inputAmount)
        .mul(spot.raw.toString())
        .div(parseEther('1'))
      slippage =
        (parseInt(actualPremium.raw.toString()) /
          parseInt(spotSize.toString()) -
          1) *
        100
      // sell long, Trade.getClosePremium
    } else if (
      orderType === Operation.CLOSE_LONG ||
      orderType === Operation.WRITE
    ) {
      spot = this.spotClosePremium
      const shortSize = this.option.proportionalShort(inputAmount)
      parsedAmount = new TokenAmount(this.option.redeem, shortSize.toString())
      actualPremium = this.getClosePremium(parsedAmount)
      const spotSize = BigNumber.from(inputAmount)
        .mul(spot.raw.toString())
        .div(parseEther('1'))
      slippage =
        (parseInt(actualPremium.raw.toString()) /
          parseInt(spotSize.toString()) -
          1) *
        100
      // buy short swap from UNDER -> RDM
    } else if (orderType === Operation.SHORT) {
      parsedAmount = new TokenAmount(this.option.redeem, inputAmount.toString())
      spot = this.spotShortPremium
      const spotSize = BigNumber.from(inputAmount)
        .mul(spot.raw.toString())
        .div(parseEther('1'))
      actualPremium = this.getShortPremium(parsedAmount)
      slippage =
        (parseInt(actualPremium.raw.toString()) /
          parseInt(spotSize.toString()) -
          1) *
        100
      // sell short, RDM -> UNDER
    } else if (orderType === Operation.CLOSE_SHORT) {
      parsedAmount = new TokenAmount(this.option.redeem, inputAmount.toString())
      spot = this.spotShortPremium
      const spotSize = BigNumber.from(inputAmount)
        .mul(spot.raw.toString())
        .div(parseEther('1'))
      actualPremium = this.getShortPremium(parsedAmount)
      slippage =
        (parseInt(actualPremium.raw.toString()) /
          parseInt(spotSize.toString()) -
          1) *
        100
    }
    return [spot, actualPremium, slippage]
  }

  public getOptionsAddedAsLiquidity = (
    inputAmount: TokenAmount
  ): TokenAmount => {
    const ratio = this.option.proportionalShort(
      this.option.baseValue.raw.toString()
    )
    const denominator = ratio
      .mul(this.reserveOf(this.option.underlying).raw.toString())
      .div(this.reserveOf(this.option.redeem).raw.toString())
      .add(parseEther('1'))

    const optionsInput = BigNumber.from(inputAmount.raw.toString())
      .mul(parseEther('1'))
      .div(denominator)

    return new TokenAmount(this.option.underlying, optionsInput.toString())
  }

  public getLiquidityValuePerShare = (
    totalSupply: TokenAmount
  ): [TokenAmount, TokenAmount, TokenAmount] => {
    const shortValue = this.getLiquidityValue(
      this.option.redeem,
      new TokenAmount(this.liquidityToken, totalSupply.raw.toString()),
      new TokenAmount(this.liquidityToken, parseEther('1').toString())
    )

    const underlyingValue = this.getLiquidityValue(
      this.option.underlying,
      new TokenAmount(this.liquidityToken, totalSupply.raw.toString()),
      new TokenAmount(this.liquidityToken, parseEther('1').toString())
    )

    const totalUnderlyingValue = new TokenAmount(
      this.option.underlying,
      BigNumber.from(shortValue.raw.toString())
        .mul(this.option.baseValue.raw.toString())
        .div(this.option.quoteValue.raw.toString())
        .add(underlyingValue.raw.toString())
        .toString()
    )

    return [shortValue, underlyingValue, totalUnderlyingValue]
  }
}
