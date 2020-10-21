import { Quantity } from './quantity'
import { Option } from './option'
import { Direction } from '../constants'

export class Trade {
  public readonly option: Option
  public readonly inputAmount: Quantity
  public readonly direction: Direction

  public constructor(option: Option, amount: Quantity, direction: Direction) {
    this.option = option
    this.inputAmount = amount
    this.direction = direction
  }
}
