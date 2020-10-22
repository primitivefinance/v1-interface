import { BigNumberish } from 'ethers'
import { Token } from './token'
import { Quantity } from './quantity'

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
    address: string,
    decimals: number,
    name?: string,
    symbol?: string
  ) {
    super(address, decimals, name, symbol)
    this.optionParameters = optionParameters
  }
}
