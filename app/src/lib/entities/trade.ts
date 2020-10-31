import ethers from 'ethers'
import { Option } from './option'
import { Operation } from '../constants'
import { Quantity } from './quantity'
import UniswapV2Pair from '@uniswap/v2-core/build/UniswapV2Pair.json'

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
    console.log(ethers.BigNumber.isBigNumber(slippagePercent), slippagePercent)
    const slippage = ethers.BigNumber.from(+slippagePercent * 1000)
    const amountIn = ethers.BigNumber.from(this.inputAmount.quantity)
    const one = ethers.BigNumber.from(1000)
    const slippageAdjustedValue = amountIn.mul(one.add(slippage)).div(1000)
    const formattedValue = slippageAdjustedValue
    console.log(`max amount in: ${formattedValue.toString()}`)
    return new Quantity(this.inputAmount.asset, formattedValue)
  }

  public minimumAmountOut(slippagePercent: string): Quantity {
    if (this.operation === Operation.LONG) {
      console.log(`min amount out: ${this.inputAmount.quantity.toString()}`)
      return this.inputAmount
    }
    console.log(ethers.BigNumber.isBigNumber(slippagePercent))
    const slippage = ethers.BigNumber.from(slippagePercent.toString())
    const amountIn = ethers.BigNumber.from(this.inputAmount.quantity)
    const one = ethers.BigNumber.from(1)
    const slippageAdjustedValue = amountIn.mul(one.add(slippage))
    const formattedValue = slippageAdjustedValue
    console.log(`min amount out: ${formattedValue.toString()}`)
    return new Quantity(this.inputAmount.asset, formattedValue)
  }

  public sortTokens = (tokenA, tokenB) => {
    let tokens = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA]
    return tokens
  }

  public getReserves = async (signer, factory, tokenA, tokenB) => {
    let tokens = this.sortTokens(tokenA, tokenB)
    let token0 = tokens[0]
    let pair = new ethers.Contract(
      '0x3269931d3108603ba63BDD401Fd6e3E0C6b90eb7',
      UniswapV2Pair.abi,
      signer
    )
    let reserves = await pair.getReserves()
    let _reserve0 = reserves._reserve0
    let _reserve1 = reserves._reserve1
    reserves =
      tokenA == token0 ? [_reserve0, _reserve1] : [_reserve1, _reserve0]
    return [reserves[0], reserves[1]]
  }

  public getAmountsOut = async (signer, factory, amountIn, path) => {
    let amounts = [amountIn]
    console.log('getting amounts')
    for (let i = 0; i < path.length; i++) {
      console.log(path[0], path[1])
      let [reserveIn, reserveOut] = await this.getReserves(
        signer,
        factory,
        path[0],
        path[1]
      )
      console.log(reserveIn, reserveOut)
      amounts.push(this.getAmountOut(amounts[i], reserveIn, reserveOut))
    }
    console.log('got maounts')
    return amounts
  }

  public getAmountOut = (amountIn, reserveIn, reserveOut) => {
    let amountInWithFee = ethers.BigNumber.from(amountIn.toString()).mul(997)
    let numerator = amountInWithFee.mul(
      ethers.BigNumber.from(reserveOut.toString())
    )
    let denominator = ethers.BigNumber.from(reserveIn.toString())
      .mul(1000)
      .add(amountInWithFee)
    let amountOut = numerator.div(denominator)
    return amountOut
  }
}
