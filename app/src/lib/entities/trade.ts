import ethers from 'ethers'
import { Option } from './option'
import { Operation } from '../constants'
import { Quantity } from './quantity'
import UniswapV2Pair from '@uniswap/v2-core/build/UniswapV2Pair.json'
import { parseEther } from 'ethers/lib/utils'

export class Trade {
  public readonly option: Option
  public inputAmount: Quantity
  public outputAmount: Quantity
  public path: string[]
  public reserves: string[] | ethers.BigNumber[]
  public totalSupply: string
  public amountsIn: string[]
  public amountsOut: string[]
  public readonly operation: Operation
  public readonly signer: ethers.Signer

  public constructor(
    option: Option,
    inputAmount: Quantity,
    outputAmount: Quantity,
    path: string[],
    reserves: string[] | ethers.BigNumber[],
    totalSupply: string,
    amountsIn: string[],
    amountsOut: string[],
    operation: Operation,
    signer: ethers.Signer
  ) {
    this.option = option
    this.inputAmount = inputAmount
    this.outputAmount = outputAmount
    this.path = path
    this.reserves = reserves
    this.totalSupply = totalSupply
    this.amountsIn = amountsIn
    this.amountsOut = amountsOut
    this.operation = operation ? operation : null
    this.signer = signer
  }

  public calcMaximumInSlippage(
    amount: any,
    slippagePercent: string
  ): ethers.ethers.BigNumber {
    if (this.operation === Operation.SHORT) {
      return amount
    }
    const slippage = ethers.BigNumber.from(+slippagePercent * 1000)
    const amountIn = ethers.BigNumber.from(amount)
    const one = ethers.BigNumber.from(1000)
    const slippageAdjustedValue = amountIn.mul(one.add(slippage)).div(1000)
    const formattedValue = slippageAdjustedValue
    return formattedValue
  }

  public calcMinimumOutSlippage(
    amount: any,
    slippagePercent: string
  ): ethers.ethers.BigNumber {
    if (
      this.operation === Operation.SHORT ||
      this.operation === Operation.ADD_LIQUIDITY
    ) {
      return amount
    }
    const slippage = ethers.BigNumber.from(+slippagePercent * 1000)
    const amountIn = ethers.BigNumber.from(amount)
    const one = ethers.BigNumber.from(1000)
    const slippageAdjustedValue = amountIn.mul(one.sub(slippage)).div(1000)
    const formattedValue = slippageAdjustedValue
    return formattedValue
  }

  public maximumAmountIn(slippagePercent: string): Quantity {
    if (
      this.operation === Operation.SHORT ||
      this.operation === Operation.CLOSE_SHORT
    ) {
      return this.inputAmount
    }
    const slippage = ethers.BigNumber.from(+slippagePercent * 1000)
    const amountIn = ethers.BigNumber.from(this.inputAmount.quantity)
    const one = ethers.BigNumber.from(1000)
    const slippageAdjustedValue = amountIn.mul(one.add(slippage)).div(1000)
    const formattedValue = slippageAdjustedValue
    return new Quantity(this.inputAmount.asset, formattedValue)
  }

  public minimumAmountOut(slippagePercent: string): Quantity {
    if (this.operation === Operation.LONG) {
      return this.outputAmount
    }
    const slippage = ethers.BigNumber.from(+slippagePercent * 1000)
    const amountIn = ethers.BigNumber.from(this.outputAmount.quantity)
    const one = ethers.BigNumber.from(1000)
    const slippageAdjustedValue = amountIn.mul(one.sub(slippage)).div(1000)
    const formattedValue = slippageAdjustedValue
    return new Quantity(this.outputAmount.asset, formattedValue)
  }

  public sortTokens = (tokenA, tokenB) => {
    const tokens = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA]
    return tokens
  }

  public getTotalSupply = async (signer, factory, tokenA, tokenB) => {
    const tokens = this.sortTokens(tokenA, tokenB)
    const pairAddress = await factory.getPair(tokens[0], tokens[1])
    const pair = new ethers.Contract(pairAddress, UniswapV2Pair.abi, signer)
    const totalSupply = await pair.totalSupply()
    return totalSupply
  }

  public getReserves = async (signer, factory, tokenA, tokenB) => {
    const tokens = this.sortTokens(tokenA, tokenB)
    const token0 = tokens[0]
    const pairAddress = await factory.getPair(tokens[0], tokens[1])
    const pair = new ethers.Contract(pairAddress, UniswapV2Pair.abi, signer)
    let reserves = await pair.getReserves()
    const _reserve0 = reserves._reserve0
    const _reserve1 = reserves._reserve1
    reserves =
      tokenA == token0 ? [_reserve0, _reserve1] : [_reserve1, _reserve0]
    return [reserves[0], reserves[1]]
  }

  public getAmountsOut = async (signer, factory, amountIn, path) => {
    const amounts = [amountIn]
    for (let i = 0; i < path.length - 1; i++) {
      const [reserveIn, reserveOut] = await this.getReserves(
        signer,
        factory,
        path[i],
        path[i + 1]
      )
      console.log(reserveIn, reserveOut)
      amounts.push(Trade.getAmountOut(amounts[i], reserveIn, reserveOut))
    }
    console.log(amounts)
    return amounts
  }

  public static getAmountOut = (amountIn, reserveIn, reserveOut) => {
    const amountInWithFee = ethers.BigNumber.from(amountIn.toString()).mul(997)
    const numerator = amountInWithFee.mul(
      ethers.BigNumber.from(reserveOut.toString())
    )
    const denominator = ethers.BigNumber.from(reserveIn.toString())
      .mul(1000)
      .add(amountInWithFee)
    const amountOut = numerator.div(denominator)
    return amountOut
  }

  public static getAmountsOutPure = (amountIn, path, reserveIn, reserveOut) => {
    const amounts = [amountIn]
    for (let i = 0; i < path.length; i++) {
      amounts[i + 1] = Trade.getAmountOut(amounts[i], reserveIn, reserveOut)
    }
    return amounts
  }

  public getAmountsIn = async (signer, factory, amountOut, path) => {
    const amounts = ['', amountOut]
    for (let i = path.length - 1; i > 0; i--) {
      const [reserveIn, reserveOut] = await this.getReserves(
        signer,
        factory,
        path[i - 1],
        path[i]
      )
      amounts[i - 1] = Trade.getAmountIn(amounts[i], reserveIn, reserveOut)
    }

    return amounts
  }

  public static getAmountIn = (amountOut, reserveIn, reserveOut) => {
    const numerator = reserveIn.mul(amountOut).mul(1000)
    const denominator = reserveOut.sub(amountOut).mul(997)
    const amountIn = numerator.div(denominator).add(1)
    return amountIn
  }

  public static getAmountsInPure = (amountOut, path, reserveIn, reserveOut) => {
    const amounts = ['', amountOut]
    for (let i = path.length - 1; i > 0; i--) {
      amounts[i - 1] = Trade.getAmountIn(amounts[i], reserveIn, reserveOut)
    }

    return amounts
  }

  public getPremium = (
    quantityOptions,
    base,
    quote,
    path, // redeem -> underlying
    reserves
  ) => {
    // PREMIUM MATH
    const redeemsMinted = ethers.BigNumber.from(quantityOptions)
      .mul(quote)
      .div(base)
    const amountsIn = Trade.getAmountsInPure(
      quantityOptions,
      path,
      reserves[0],
      reserves[1]
    )
    const redeemsRequired = amountsIn[0]
    const redeemCostRemaining = redeemsRequired.sub(redeemsMinted)
    // if redeemCost > 0
    const amountsOut = Trade.getAmountsOutPure(
      redeemCostRemaining,
      path,
      reserves[0],
      reserves[1]
    )
    const premium = amountsOut[1].mul(100101).add(amountsOut[1]).div(100000)
    return premium
  }

  public static getSpotPremium = (
    base,
    quote,
    path, // redeem -> underlying
    reserves
  ) => {
    // PREMIUM MATH
    const quantity = parseEther('1')
    const redeemsMinted = ethers.BigNumber.from(quantity).mul(quote).div(base)
    const amountsIn = Trade.getAmountsInPure(
      quantity,
      path,
      reserves[0],
      reserves[1]
    )
    const redeemsRequired = amountsIn[0]
    const redeemCostRemaining = redeemsRequired.sub(redeemsMinted)
    // if redeemCost > 0
    const amountsOut = Trade.getAmountsOutPure(
      redeemCostRemaining,
      path,
      reserves[0],
      reserves[1]
    )
    const premium = amountsOut[1].mul(100101).add(amountsOut[1]).div(100000)
    return premium
  }

  public quote = (amountA, reserveA, reserveB) => {
    const amountB = ethers.BigNumber.from(amountA).mul(reserveB).div(reserveA)
    return amountB
  }
}
