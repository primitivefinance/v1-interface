// Reference https://github.com/devanp92/black-scholes-js

import { Asset, Option } from '../entities'
import { NormalDistribution } from './normaldistribution'

export interface BlackScholesInterface {
  standardDeviation?: number

  delta(): number | null
  gamma(): number | null
  theta(): number | null
  rho(): number | null
  vega(): number | null
  value(): number | null
}

export class BlackScholes implements BlackScholesInterface {
  asset: Asset
  option: Option
  riskFree: number
  deviation: number
  assetPrice: number
  /**
   * Initialize asset with symbol
   * @param symbol
   */
  constructor(decimals: number, name: string, symbol: string, option: Option) {
    // Set asset values
    this.setAsset(decimals, name, symbol)
    this.option = option
  }

  /**
   * Set risk free rate
   * @param riskFree
   */
  setRiskFree(riskFree?: number) {
    this.riskFree = riskFree
  }

  /**
   * Set deviation
   * @param deviation
   */
  setDeviation(deviation: number) {
    this.deviation = deviation
  }

  /**
   * Set asset symbol
   * @param symbol
   */
  private setAsset(decimals: number, name: string, symbol: string) {
    this.asset = new Asset(decimals, name, symbol)
    this.getCurrentPrice(symbol).then((price) => (this.assetPrice = price))
  }

  /**
   * First partial derivative of asset price
   * (velocity)
   */
  delta(): number | null {
    if (isUndefinedOrNull(this.d1)) {
      return null
    }

    const delta = NormalDistribution.cdf(this.d1)

    return _toFixed(delta, 3)
  }

  /**
   * Second partial derivative of Stock price movement
   * (acceleration)
   */
  gamma(): number | null {
    if (isUndefinedOrNull(this.normPDFD1)) {
      return null
    }

    const gamma =
      NormalDistribution.pdf(this.normPDFD1) /
      (this.assetPrice *
        this.deviation *
        Math.sqrt(this.option.getTimeToExpiry()))

    return _toFixed(gamma, 3)
  }

  /**
   * First partial derivative of time to maturity
   * (time decay)
   * Theta of value -10 means the option is losing $10 in time value each day.
   */
  theta(): number | null {
    if (isUndefinedOrNull(this.d2)) {
      return null
    }

    if (isUndefinedOrNull(this.d1)) {
      return null
    }

    if (isUndefinedOrNull(this.normPDFD1)) {
      return null
    }

    const sign = this.option.isCall ? 1 : -1

    const theta =
      (-1 *
        this.assetPrice *
        NormalDistribution.cdf(this.d1) *
        this.deviation) /
        (2 * Math.sqrt(this.option.getTimeToExpiry())) -
      sign *
        this.riskFree *
        +this.option.strikePrice.quantity *
        Math.exp(-1 * this.riskFree * this.option.getTimeToExpiry()) *
        NormalDistribution.pdf(sign * this.d2)

    return _toFixed(theta, 3)
  }

  /**
   * First partial derivative of risk-free rate
   * How much a change in 1% of interest rates impacts the option's price
   */
  rho(): number | null {
    if (isUndefinedOrNull(this.d2)) {
      return null
    }

    const sign = this.option.isCall ? 1 : -1

    const expiryTime = this.option.getTimeToExpiry()

    const rho =
      sign *
      +this.option.strikePrice.quantity *
      expiryTime *
      Math.exp(-1 * this.riskFree * expiryTime) *
      NormalDistribution.cdf(sign * this.d2)

    return _toFixed(rho, 3)
  }

  /**
   * First partial derivative of deviation (volatility)
   * How much a change in 1% of the underlying assets impacts the option's price
   */
  vega(): number | null {
    if (isUndefinedOrNull(this.d1)) {
      return null
    }

    if (isUndefinedOrNull(this.d2)) {
      return null
    }

    const expiryTime = this.option.getTimeToExpiry()

    const vega =
      this.assetPrice *
      Math.sqrt(this.option.getTimeToExpiry()) *
      NormalDistribution.pdf(this.d1)

    return _toFixed(vega, 3)
  }

  value(): number | null {
    if (isUndefinedOrNull(this.d1)) {
      return null
    }

    if (isUndefinedOrNull(this.d2)) {
      return null
    }

    // One day
    const minTimeToExpire = 1 / 365

    const sign = this.option.isCall ? 1 : -1

    if (this.option.getTimeToExpiry() < minTimeToExpire) {
      return Math.max(
        sign * (this.assetPrice - +this.option.strikePrice.quantity),
        0
      )
    }

    const priceNorm = this.assetPrice * NormalDistribution.cdf(sign * this.d1)
    const strikeRisk =
      +this.option.strikePrice.quantity *
      Math.exp(-1 * this.riskFree * this.option.getTimeToExpiry()) *
      NormalDistribution.cdf(sign * this.d2)

    if (this.option.isCall) {
      return priceNorm - strikeRisk
    } else {
      return strikeRisk - priceNorm
    }
  }

  get d1(): number | null {
    const timeToExpiry = this.option.getTimeToExpiry()

    if (timeToExpiry < 0) {
      return null
    }

    return (
      (Math.log(this.assetPrice / +this.option.strikePrice.quantity) +
        (this.riskFree + Math.pow(this.deviation, 2) / 2) * timeToExpiry) /
      (this.deviation * Math.sqrt(timeToExpiry))
    )
  }

  get d2(): number | null {
    const d1 = this.d1

    if (isUndefinedOrNull(this.d1)) {
      return null
    }

    return d1 - this.deviation * Math.sqrt(this.option.getTimeToExpiry())
  }

  get normPDFD1(): number | null {
    if (isUndefinedOrNull(this.d1)) {
      return null
    }

    return NormalDistribution.pdf(this.d1)
  }

  async getRiskRate() {
    const expiryTime = 0

    if (expiryTime < 0) {
      throw new Error('Option has already expired')
    }

    return 0
  }

  async getCurrentPrice(name: string): Promise<number> {
    let price: string
    const priceAPI = `https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=usd&include_24hr_change=true`
    fetch(priceAPI)
      .then((res) => res.json())
      .then(
        (result) => {
          let key = Object.keys(result)[0]
          price = result[key].usd
          let asset = result[key]
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log(error)
        }
      )

    return +price
  }
}

function _toFixed(x: number, numDigits: number) {
  const powerOfTen = Math.pow(10, numDigits)
  const roundedToNearestNth = Math.round(x * powerOfTen) / powerOfTen

  return parseFloat(roundedToNearestNth.toFixed(numDigits))
}

function isUndefinedOrNull(obj: any): boolean {
  return obj === undefined || obj === null
}