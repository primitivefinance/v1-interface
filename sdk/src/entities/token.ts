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
    decimals: number,
    name?: string,
    symbol?: string
  ) {
    super(decimals, name, symbol)
    this.chainId = chainId
    this.address = address
  }
}
