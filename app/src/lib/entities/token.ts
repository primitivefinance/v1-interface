import { Asset } from './asset'

/**
 * Represents an ERC-20 token on Ethereum.
 */
export class Token extends Asset {
  public readonly address: string
  public readonly chainId: number

  public constructor(
    chainId: number,
    address: string,
    decimals?: number,
    name?: string,
    symbol?: string
  ) {
    super(decimals, name, symbol)
    this.chainId = chainId
    this.address = address
  }

  public sortsBefore(otherToken: Token): boolean {
    if (otherToken.chainId !== this.chainId) {
      throw new Error('Cannot be checked across chains.')
    }
    if (otherToken.address === this.address) {
      throw new Error('Cannot be same address.')
    }
    return this.address.toLowerCase() < otherToken.address.toLowerCase()
  }
}
