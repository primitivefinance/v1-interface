// Reference https://www.johndcook.com/blog/python_phi/
// Reference https://github.com/devanp92/black-scholes-js/blob/master/src/lib/normaldist.ts
export class NormalDistribution {
  static cdf(x: number): number {
    return 0.5 * (1 + this._phi(x / Math.sqrt(2)))
  }

  static pdf(x: number): number {
    const denom = Math.sqrt(Math.PI * 2)
    const numer = Math.exp(-0.5 * Math.pow(x, 2))
    return numer / denom
  }

  private static _phi(x: number): number {
    // save the sign of x
    const sign = x >= 0 ? 1 : -1
    x = Math.abs(x)

    // z-scores
    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911

    // A&S formula 7.1.26
    const t = 1.0 / (1.0 + p * x)
    const y =
      1.0 -
      ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
    return sign * y // erf(-x) = -erf(x);
  }
}
