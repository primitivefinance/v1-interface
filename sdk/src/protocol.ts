import ethers from 'ethers'
import { Option, OptionParameters } from './entities/option'
import OptionContract from '@primitivefi/contracts/artifacts/Option.json'
import ERC20 from '@primitivefi/contracts/artifacts/ERC20.json'
import { Asset, Quantity } from './entities'
import { OPTION_FACTORY_ADDRESS, OPTION_SALT } from './constants'
import computeClone2Clone from './utils/computeCreate2Clone'
/**
 * Methods for asyncronously getting on-chain data and returning SDK classes using the data.
 */
export class Protocol {
  private constructor() {}

  /**
   * Gets an on-chain option's parameters using an option address and returns an option class using the data.
   */
  public static async getOption(
    address: string,
    provider: ethers.providers.Provider
  ): Promise<Option> {
    const parameters = await new ethers.Contract(
      address,
      OptionContract.abi,
      provider
    ).getParameters()
    const underlying: ethers.Contract = new ethers.Contract(
      parameters._underlyingToken,
      ERC20.abi,
      provider
    )
    const strike: ethers.Contract = new ethers.Contract(
      parameters._strikeToken,
      ERC20.abi,
      provider
    )

    const optionParameters: OptionParameters = {
      base: new Quantity(
        new Asset(
          await underlying.decimals(),
          await underlying.name(),
          await underlying.symbol()
        ),
        parameters._base
      ),
      quote: new Quantity(
        new Asset(
          await strike.decimals(),
          await strike.name(),
          await strike.symbol()
        ),
        parameters._quote
      ),
      expiry: parameters._expiry,
    }

    return new Option(
      optionParameters,
      address,
      18,
      'Primitive V1 Option',
      'PRM'
    )
  }

  public static getOptionAddressFromCreate2(
    underlyingToken: string,
    strikeToken: string,
    base: string,
    quote: string,
    expiry: number
  ): string {
    const from: string = OPTION_FACTORY_ADDRESS
    const salt: string = ethers.utils.solidityKeccak256(
      ['bytes'],
      [OPTION_SALT, underlyingToken, strikeToken, base, quote, expiry]
    )

    return computeClone2Clone(from, salt)
  }
}
