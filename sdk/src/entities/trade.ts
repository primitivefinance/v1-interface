import { Quantity } from './quantity'
import { Option } from './option'
import { Direction, Operation } from '../constants'
import ethers from 'ethers'

export class Trade {
  public readonly option: Option
  public readonly inputAmount: Quantity
  public readonly direction: Direction
  public readonly operation: Operation

  public constructor(
    option: Option,
    amount: Quantity,
    direction: Direction,
    operation?: Operation
  ) {
    this.option = option
    this.inputAmount = amount
    this.direction = direction
    this.operation = operation
  }

  public maximumAmountIn(slippagePercent: string): Quantity {
    if (this.direction === Direction.SHORT) {
      return this.inputAmount
    }
    const slippage = ethers.BigNumber.from(slippagePercent)
    const amountIn = ethers.BigNumber.from(this.inputAmount.quantity)
    const one = ethers.BigNumber.from(1)
    const slippageAdjustedValue = amountIn.mul(one.add(slippage))
    return new Quantity(this.inputAmount.asset, slippageAdjustedValue)
  }

  public minimumAmountOut(slippagePercent: string): Quantity {
    if (this.direction === Direction.LONG) {
      return this.inputAmount
    }
    const slippage = ethers.BigNumber.from(slippagePercent)
    const amountIn = ethers.BigNumber.from(this.inputAmount.quantity)
    const one = ethers.BigNumber.from(1)
    const slippageAdjustedValue = amountIn.mul(one.add(slippage))
    return new Quantity(this.inputAmount.asset, slippageAdjustedValue)
  }
}
