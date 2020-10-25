import ethers from 'ethers'
import { Option } from './option'
import { Operation } from '../constants'
import { Quantity } from './quantity'

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
    const formattedValue = slippageAdjustedValue
    console.log(`max amount in: ${formattedValue.toString()}`)
    return new Quantity(this.inputAmount.asset, formattedValue)
  }

  public minimumAmountOut(slippagePercent: string): Quantity {
    if (this.operation === Operation.LONG) {
      console.log(`min amount out: ${this.inputAmount.quantity.toString()}`)
      return this.inputAmount
    }
    const slippage = ethers.BigNumber.from(slippagePercent)
    const amountIn = ethers.BigNumber.from(this.inputAmount.quantity)
    const one = ethers.BigNumber.from(1)
    const slippageAdjustedValue = amountIn.mul(one.add(slippage))
    const formattedValue = slippageAdjustedValue
    console.log(`min amount out: ${formattedValue.toString()}`)
    return new Quantity(this.inputAmount.asset, formattedValue)
  }
}
