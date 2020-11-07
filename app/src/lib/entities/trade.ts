import ethers, { BigNumberish, BigNumber } from 'ethers'
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
  public reserves: BigNumberish[] | ethers.BigNumber[]
  public totalSupply: BigNumberish
  public amountsIn: BigNumberish[]
  public amountsOut: BigNumberish[]
  public readonly operation: Operation
  public readonly signer: ethers.Signer

  public constructor(
    option: Option,
    inputAmount: Quantity,
    outputAmount: Quantity,
    path: string[],
    reserves: BigNumberish[] | ethers.BigNumber[],
    totalSupply: BigNumberish,
    amountsIn: BigNumberish[],
    amountsOut: BigNumberish[],
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

  public sortTokens = (tokenA: string, tokenB: string): string[] => {
    let tokens: string[] = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA]
    return tokens
  }

  public getTotalSupply = async (
    signer: ethers.Signer,
    factory: ethers.Contract,
    tokenA: string,
    tokenB: string
  ): Promise<BigNumberish> => {
    let tokens = this.sortTokens(tokenA, tokenB)
    let pairAddress = await factory.getPair(tokens[0], tokens[1])
    let pair = new ethers.Contract(pairAddress, UniswapV2Pair.abi, signer)
    let totalSupply = await pair.totalSupply()
    return totalSupply
  }

  public getReserves = async (
    signer: ethers.Signer,
    factory: ethers.Contract,
    tokenA: string,
    tokenB: string
  ): Promise<BigNumberish[]> => {
    let tokens = this.sortTokens(tokenA, tokenB)
    let token0 = tokens[0]
    let pairAddress = await factory.getPair(tokens[0], tokens[1])
    if (pairAddress === ethers.constants.AddressZero) {
      return [0, 0]
    }
    let pair = new ethers.Contract(pairAddress, UniswapV2Pair.abi, signer)
    let reserves = await pair.getReserves()
    const _reserve0 = reserves._reserve0
    const _reserve1 = reserves._reserve1
    reserves =
      tokenA == token0 ? [_reserve0, _reserve1] : [_reserve1, _reserve0]
    return [reserves[0], reserves[1]]
  }

  public getAmountsOut = async (
    signer: ethers.Signer,
    factory: ethers.Contract,
    amountIn: BigNumberish,
    path: string[]
  ): Promise<BigNumberish[]> => {
    let amounts: BigNumberish[] = [amountIn]
    for (let i = 0; i < path.length - 1; i++) {
      const [reserveIn, reserveOut] = await this.getReserves(
        signer,
        factory,
        path[i],
        path[i + 1]
      )
      amounts.push(Trade.getAmountOut(amounts[i], reserveIn, reserveOut))
    }
    return amounts
  }

  public static getAmountOut = (
    amountIn: BigNumberish,
    reserveIn: BigNumberish,
    reserveOut: BigNumberish
  ): BigNumberish => {
    let amountInWithFee = ethers.BigNumber.from(amountIn.toString()).mul(997)
    let numerator = amountInWithFee.mul(
      ethers.BigNumber.from(reserveOut.toString())
    )
    const denominator = ethers.BigNumber.from(reserveIn.toString())
      .mul(1000)
      .add(amountInWithFee)
    const amountOut = numerator.div(denominator)
    return amountOut
  }

  public static getAmountsOutPure = (
    amountIn: BigNumberish,
    path: string[],
    reserveIn: BigNumberish,
    reserveOut: BigNumberish
  ): BigNumberish[] => {
    let amounts = [amountIn]
    for (let i = 0; i < path.length; i++) {
      amounts[i + 1] = Trade.getAmountOut(amounts[i], reserveIn, reserveOut)
    }
    return amounts
  }

  public getAmountsIn = async (
    signer: ethers.Signer,
    factory: ethers.Contract,
    amountOut: BigNumberish,
    path: string[]
  ): Promise<BigNumberish[]> => {
    let amounts = ['', amountOut]
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

  public static getAmountIn = (
    amountOut: BigNumberish,
    reserveIn: BigNumberish,
    reserveOut: BigNumberish
  ): BigNumberish => {
    let numerator = BigNumber.from(reserveIn).mul(amountOut).mul(1000)
    let denominator = BigNumber.from(reserveOut).sub(amountOut).mul(997)
    let amountIn = numerator.div(denominator).add(1)
    return amountIn
  }

  public static getAmountsInPure = (
    amountOut: BigNumberish,
    path: string[],
    reserveIn: BigNumberish,
    reserveOut: BigNumberish
  ): BigNumberish[] => {
    let amounts = ['', amountOut]
    for (let i = path.length - 1; i > 0; i--) {
      amounts[i - 1] = Trade.getAmountIn(amounts[i], reserveIn, reserveOut)
    }

    return amounts
  }

  public static getPremium = (
    quantityOptions: BigNumberish,
    base: BigNumberish,
    quote: BigNumberish,
    path: string[], // redeem -> underlying
    reserves: BigNumberish[]
  ): BigNumberish => {
    if (BigNumber.from(reserves[0]).isZero()) {
      return 0
    }
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
    let redeemsRequired = amountsIn[0]
    let redeemCostRemaining = BigNumber.from(redeemsRequired).sub(redeemsMinted)
    // if redeemCost > 0
    const amountsOut = Trade.getAmountsOutPure(
      redeemCostRemaining,
      path,
      reserves[0],
      reserves[1]
    )
    let premium = BigNumber.from(amountsOut[1])
      .mul(100101)
      .add(amountsOut[1])
      .div(100000)
    return premium
  }

  public static getSpotPremium = (
    base: BigNumberish,
    quote: BigNumberish,
    path: string[], // redeem -> underlying
    reserves: BigNumberish[]
  ): BigNumberish => {
    let quantity = parseEther('1')
    let premium = Trade.getPremium(quantity, base, quote, path, reserves)
    return premium
  }

  public quote = (
    amountA: BigNumberish,
    reserveA: BigNumberish,
    reserveB: BigNumberish
  ): BigNumberish => {
    let amountB
    if (ethers.BigNumber.from(reserveA).isZero()) {
      amountB = 0
    } else {
      amountB = ethers.BigNumber.from(amountA).mul(reserveB).div(reserveA)
    }
    return amountB
  }
}
