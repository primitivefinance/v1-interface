import { BigNumber } from 'ethers'
import { parseUnits } from '@ethersproject/units'

export function tryParseAmount(value?: string): BigNumber | undefined {
  if (
    !value ||
    value === '0' ||
    value === '.' ||
    value === undefined ||
    (value.indexOf('0') === 0 && value.indexOf('.') === 1)
  )
    return parseUnits('0', 18)

  const typedValueParsed = parseUnits(value, 18).toString()
  if (typedValueParsed !== '0') {
    return BigNumber.from(typedValueParsed)
  }
}
