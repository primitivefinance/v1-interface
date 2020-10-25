import { BigNumberish } from 'ethers'
import { Token } from './token'
import { Asset } from './asset'
import { Quantity } from './quantity'
import ethers from 'ethers'

export interface OptionParameters {
  base: Quantity
  quote: Quantity
  expiry: number
}

/**
 * Represents a Primitive V1 Option.
 */
export class Option extends Token {
  public readonly optionParameters: OptionParameters
  public constructor(
    optionParameters: OptionParameters,
    chainId: number,
    address: string,
    decimals: number,
    name?: string,
    symbol?: string
  ) {
    super(chainId, address, decimals, name, symbol)
    this.optionParameters = optionParameters
  }

  public get underlying(): Asset {
    return this.optionParameters.base.asset
  }

  public get strike(): Asset {
    return this.optionParameters.quote.asset
  }

  public get base(): Quantity {
    return this.optionParameters.base
  }

  public get quote(): Quantity {
    return this.optionParameters.quote
  }

  public get expiry(): number {
    return this.optionParameters.expiry
  }

  public get strikePrice(): Quantity {
    let baseValue = this.optionParameters.base.quantity
    let quoteValue = this.optionParameters.quote.quantity
    let strikePrice: Quantity
    if (baseValue === '0') {
      strikePrice = this.optionParameters.quote
    } else if (quoteValue === '0') {
      strikePrice = this.optionParameters.base
    } else {
      let numerator = ethers.BigNumber.from(
        this.optionParameters.quote.quantity
      )
      let denominator = ethers.BigNumber.from(
        this.optionParameters.base.quantity
      )
      strikePrice = new Quantity(
        this.optionParameters.quote.asset,
        numerator.div(denominator)
      )
    }
    return strikePrice
  }

  public get isCall(): boolean {
    let baseValue = this.optionParameters.base.quantity
    let quoteValue = this.optionParameters.quote.quantity
    let isCall: boolean
    if (baseValue === '0') {
      isCall = true
    } else if (quoteValue === '0') {
      isCall = false
    } else {
      return null
    }
    return isCall
  }

  public get isPut(): boolean {
    let baseValue = this.optionParameters.base.quantity
    let quoteValue = this.optionParameters.quote.quantity
    let isCall: boolean
    if (baseValue === '0') {
      isCall = true
    } else if (quoteValue === '0') {
      isCall = false
    } else {
      return null
    }
    return isCall
  }

  public getTimeToExpiry(): number {
    const expiry: number = this.optionParameters.expiry
    const now: number = new Date().valueOf()
    let timeLeft: number = expiry - now
    return timeLeft
  }
}