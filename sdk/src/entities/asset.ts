/**
 * Represents an instance of a coin.
 */
export class Asset {
  public readonly decimals: number
  public readonly name?: string
  public readonly symbol?: string

  public constructor(decimals: number, name?: string, symbol?: string) {
    this.decimals = decimals
    this.name = name
    this.symbol = symbol
  }
}
