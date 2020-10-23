import ethers from 'ethers'
import { Option, OptionParameters } from './entities/option'
import OptionContract from '@primitivefi/contracts/artifacts/Option.json'
import RinkebyFactory from '@primitivefi/contracts/deployments/rinkeby/OptionFactory.json'
//import MainnetFactory from '@primitivefi/contracts/deployments/live_1/OptionFactory.json'
import ERC20 from '@primitivefi/contracts/artifacts/ERC20.json'
import { Asset, Quantity, Token } from './entities'
import {
  OPTION_SALT,
  UNISWAP_FACTORY_V2,
  UNISWAP_INIT_CODE_HASH,
  STABLECOIN_ADDRESS,
} from './constants'
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
    chainId: number,
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
      chainId,
      address,
      18,
      'Primitive V1 Option',
      'PRM'
    )
  }

  public static getOptionAddressFromCreate2(
    chainId: number,
    underlyingToken: string,
    strikeToken: string,
    base: string,
    quote: string,
    expiry: number
  ): string {
    const from: string = chainId === 4 ? RinkebyFactory.address : ''
    const salt: string = ethers.utils.solidityKeccak256(
      ['bytes'],
      [OPTION_SALT, underlyingToken, strikeToken, base, quote, expiry]
    )

    return computeClone2Clone(from, salt)
  }

  public static getOptionUniswapMarketFromCreate2(
    chainId: number,
    underlyingToken: string,
    strikeToken: string,
    base: string,
    quote: string,
    expiry: number
  ): string {
    const primitiveFrom: string = chainId === 4 ? RinkebyFactory.address : ''
    const primitiveSalt: string = ethers.utils.solidityKeccak256(
      ['bytes'],
      [OPTION_SALT, underlyingToken, strikeToken, base, quote, expiry]
    )
    const optionAddress: string = computeClone2Clone(
      primitiveFrom,
      primitiveSalt
    )

    const stablecoin: Token = new Token(chainId, STABLECOIN_ADDRESS, 18)
    const option: Token = new Token(chainId, optionAddress, 18)

    const tokens: Token[] = stablecoin.sortsBefore(option)
      ? [stablecoin, option]
      : [option, stablecoin]
    const uniswapFactory: string = UNISWAP_FACTORY_V2
    const uniswapSalt: string = ethers.utils.solidityKeccak256(
      ['bytes'],
      [tokens[0].address, tokens[1].address]
    )

    return ethers.utils.getCreate2Address(
      uniswapFactory,
      uniswapSalt,
      UNISWAP_INIT_CODE_HASH
    )
  }
}
