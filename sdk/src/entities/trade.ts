import { Quantity } from './quantity'
import { Option } from './option'
import { Direction, Operation } from '../constants'

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
}
