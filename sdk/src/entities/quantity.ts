import { Asset } from './asset'
import { BigNumberish } from 'ethers'

/**
 * Represents an entity with a QUANTITY and DENOMINATION of an asset. e.g. 100 DAI.
 */
export class Quantity {
  public readonly asset: Asset
  public readonly quantity: BigNumberish
  public constructor(asset: Asset, quantity: BigNumberish) {
    this.asset = asset
    this.quantity = quantity
  }
}