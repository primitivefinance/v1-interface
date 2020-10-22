import { Asset } from './asset'

/**
 * Represents an ERC-20 token on Ethereum.
 */
export class Token extends Asset {
  public readonly address: string

  public constructor(
    address: string,
    decimals: number,
    name?: string,
    symbol?: string
  ) {
    super(decimals, name, symbol)
    this.address = address
  }
}
