import OptionContract from '@primitivefi/contracts/artifacts/Option.json'
import {
  arrayify,
  getCreate2Address,
  solidityKeccak256,
} from 'ethers/lib/utils'
import assembleClone from './assembleClone'

const OPTION_IMPLEMENTATION_SALT = solidityKeccak256(
  ['string'],
  ['primitive-option']
)
const OPTION_INITCODEHASH = solidityKeccak256(
  ['bytes'],
  [OptionContract.bytecode]
)

const computeCreate2Clone = (factory: string, salt: any) => {
  const implementation = getCreate2Address(
    factory,
    arrayify(OPTION_IMPLEMENTATION_SALT),
    arrayify(OPTION_INITCODEHASH)
  )
  return getCreate2Address(
    factory,
    salt,
    arrayify(
      solidityKeccak256(
        ['bytes'],
        [assembleClone(factory.toLowerCase(), implementation.toLowerCase())]
      )
    )
  )
}

export default computeCreate2Clone