import { Quantity } from './quantity'
import { Option } from './option'
import { Operation } from '../constants'
import ethers from 'ethers'

export class Trade {
  public readonly option: Option
  public readonly inputAmount: Quantity
  public readonly operation: Operation
  public readonly signer: ethers.Signer

  public constructor(
    option: Option,
    inputAmount: Quantity,
    operation: Operation,
    signer: ethers.Signer
  ) {
    this.option = option
    this.inputAmount = inputAmount
    this.operation = operation ? operation : null
    this.signer = signer
  }

  public maximumAmountIn(slippagePercent: string): Quantity {
    if (this.operation === Operation.SHORT) {
      return this.inputAmount
    }
    const slippage = ethers.BigNumber.from(slippagePercent)
    const amountIn = ethers.BigNumber.from(this.inputAmount.quantity)
    const one = ethers.BigNumber.from(1)
    const slippageAdjustedValue = amountIn.mul(one.add(slippage))
    return new Quantity(this.inputAmount.asset, slippageAdjustedValue)
  }

  public minimumAmountOut(slippagePercent: string): Quantity {
    if (this.operation === Operation.LONG) {
      return this.inputAmount
    }
    const slippage = ethers.BigNumber.from(slippagePercent)
    const amountIn = ethers.BigNumber.from(this.inputAmount.quantity)
    const one = ethers.BigNumber.from(1)
    const slippageAdjustedValue = amountIn.mul(one.add(slippage))
    return new Quantity(this.inputAmount.asset, slippageAdjustedValue)
  }
}
