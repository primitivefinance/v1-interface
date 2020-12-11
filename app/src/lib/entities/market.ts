import { Token, TokenAmount, Pair } from '@uniswap/sdk'
import ethers, { BigNumber, BigNumberish } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { Option } from './option'
import isZero from '@/utils/isZero'

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
  public getDepth = (): TokenAmount => {
    const underlyingReserve: TokenAmount = this.reserveOf(
      this.option.underlying
    )
    const twoPercentOfReserve: string = underlyingReserve
      .multiply('2')
      .divide('100')
      .toString()

    let redeemCost: TokenAmount
    let newPair: Pair
    if (!isZero(twoPercentOfReserve) && underlyingReserve.numerator[2]) {
      ;[redeemCost, newPair] = this.getInputAmount(
        new TokenAmount(this.option.underlying, twoPercentOfReserve.toString())
      )
    }

    const redeemCostDivMinted = BigNumber.from(redeemCost.toString()).div(
      this.option.quoteValue.raw.toString()
    )

    return new TokenAmount(this.option, redeemCostDivMinted.toString())
  }

  /**
   * @dev Gets the cost to purchase `inputAmount` of longOptionTokens, denominated in underlyingTokens.
   * @param inputAmount The quantity of longOptionTokens to purchase.
   */
  public getOpenPremium = (inputAmount: TokenAmount): TokenAmount => {
    if (!this.reserveOf(this.option.redeem).numerator[2]) {
      return new TokenAmount(this.option.underlying, '0')
    }

    const redeemsMinted = this.option.proportionalShort(
      inputAmount.raw.toString()
    )

    const [amountIn, newPair] = this.getInputAmount(inputAmount)
    const cost = BigNumber.from(amountIn.raw.toString()).gt(redeemsMinted)
      ? BigNumber.from(amountIn.raw.toString()).sub(redeemsMinted)
      : parseEther('0')
    const premium = cost.mul(this.FEE_UNITS).add(this.FEE).div(this.FEE_UNITS)
    return new TokenAmount(this.option.underlying, premium.toString())
  }

  public getSpotOpenPremium = (): TokenAmount => {
    return new TokenAmount(
      this.option.underlying,
      this.getOpenPremium(this.option.baseValue)
        .multiply(parseEther('1').toString())
        .divide(this.option.baseValue)
        .toString()
    )
  }

  /**
   * @dev Gets the payout for selling the proprotional longOptionToken amount of `inputAmount`.
   * @param inputAmount The quantity of shortOptionTokens per optionToken that needs to be closed.
   */
  public getClosePremium = (inputAmount: TokenAmount): TokenAmount => {
    if (!this.reserveOf(this.option.redeem).numerator[2]) {
      return new TokenAmount(this.option.underlying, '0')
    }

    const underlyingsMinted = this.option.proportionalLong(
      inputAmount.raw.toString()
    )

    const [amountIn, newPair] = this.getInputAmount(inputAmount)
    const payout = underlyingsMinted.gt(amountIn.raw.toString())
      ? underlyingsMinted.sub(amountIn.raw.toString())
      : parseEther('0')
    return new TokenAmount(this.option.underlying, payout.toString())
  }

  public getSpotClosePremium = (): TokenAmount => {
    return new TokenAmount(
      this.option.underlying,
      this.getClosePremium(this.option.quoteValue)
        .multiply(parseEther('1').toString())
        .divide(this.option.baseValue)
        .toString()
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
    return new TokenAmount(this.option.underlying, amountOut.toString())
  }

  public getSpotShortPremium = (): TokenAmount => {
    return this.getShortPremium(
      new TokenAmount(this.option.underlying, parseEther('1').toString())
    )
  }

  /* public get underlying(): Token {
    return this.option.isPut
      ? STABLECOINS[this.chainId]
      : this.option.underlying
  } */
}
