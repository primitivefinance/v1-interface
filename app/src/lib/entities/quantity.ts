import { Asset } from './asset'
import { BigNumber, BigNumberish } from 'ethers'

/**
 * Represents an entity with a QUANTITY and DENOMINATION of an asset. e.g. 100 DAI.
 */
export class Quantity {
  public readonly asset: Asset
  public quantity: BigNumberish | BigNumber
  public constructor(asset: Asset, quantity: BigNumberish | BigNumber) {
    this.asset = asset
    this.quantity = quantity
  }
}
