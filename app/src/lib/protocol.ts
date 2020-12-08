import ethers from 'ethers'
import { Option, OptionParameters } from './entities/option'
import Registry from '@primitivefi/contracts/artifacts/Registry.json'
import RegistryRinkeby from '@primitivefi/contracts/deployments/rinkeby/Registry.json'
import RegistryMainnet from '@primitivefi/contracts/deployments/live_1/Registry.json'
import OptionContract from '@primitivefi/contracts/artifacts/Option.json'
import RinkebyFactory from '@primitivefi/contracts/deployments/rinkeby/OptionFactory.json'
//import MainnetFactory from '@primitivefi/contracts/deployments/live_1/OptionFactory.json'
import TestERC20 from '@primitivefi/contracts/artifacts/TestERC20.json'
import UniswapV2Pair from '@uniswap/v2-core/build/UniswapV2Pair.json'
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json'
import { Token, TokenAmount } from '@uniswap/sdk'
import {
  OPTION_SALT,
  UNISWAP_FACTORY_V2,
  UNISWAP_INIT_CODE_HASH,
  STABLECOIN_ADDRESS,
} from './constants'
import computeClone2Clone from './utils/computeCreate2Clone'
import MultiCall from './multicall'
import { FACTORY_ADDRESS } from '@uniswap/sdk'

/**
 * Methods for asyncronously getting on-chain data and returning SDK classes using the data.
 */
export class Protocol {
  private constructor() {}

  public static getRegistryAddress = (chainId: number): string => {
    let address: string
    if (chainId === 4) {
      address = RegistryRinkeby.address
    } else if (chainId === 1) {
      address = RegistryMainnet.address
    } else {
      throw Error(
        `Error: getRegistryAddress cannot be found on unidentified chain ${chainId}`
      )
    }
    return address
  }

  public static async getTokensMetadataFromMultiCall(
    provider,
    tokenAddresses: string[]
  ): Promise<any> {
    const multi = new MultiCall(provider)
    const methodNames = ['name', 'symbol', 'decimals']
    let chunks = Protocol.chunkArray(tokenAddresses, 30)
    let datas = []
    let tokenDatas = []
    for (let chunk of chunks) {
      let inputs = []
      for (const token of chunk) {
        for (const method of methodNames) {
          inputs.push({
            target: token,
            function: method,
            args: [],
          })
        }
      }
      const tokenData = await multi.multiCall(TestERC20.abi, inputs)
      datas.push(tokenData)
    }

    for (let data of datas) {
      tokenDatas = tokenDatas.concat(data)
    }
    return tokenDatas
  }

  public static chunkArray(arr, n) {
    let chunkLength = Math.max(arr.length / n, 1)
    let chunks = []
    for (let i = 0; i < n; i++) {
      if (chunkLength * (i + 1) <= arr.length)
        chunks.push(arr.slice(chunkLength * i, chunkLength * (i + 1)))
    }
    return chunks
  }

  public static async getOptionParametersFromMultiCall(
    provider,
    optionAddresses: string[]
  ): Promise<any> {
    const multi = new MultiCall(provider)

    let chunks = Protocol.chunkArray(optionAddresses, 30)
    let datas = []
    let allOptionsData = []
    for (let chunk of chunks) {
      let inputs = []
      for (let option of chunk) {
        inputs.push({
          target: option,
          function: 'getParameters',
          args: [],
        })
      }
      const optionData = await multi.multiCall(OptionContract.abi, inputs)
      datas.push(optionData)
    }

    for (let data of datas) {
      allOptionsData = allOptionsData.concat(data)
    }
    return allOptionsData
  }

  public static async getAllOptionClones(provider): Promise<any> {
    const signer = await provider.getSigner()
    const registry = await Protocol.getRegistry(signer)
    const filter: any = registry.filters.DeployedOptionClone(null, null, null)
    filter.fromBlock = 7200000 // we can set a better start block later
    filter.toBlock = 'latest'

    const optionAddresses: string[] = []
    const logs = await provider.getLogs(filter)
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i]
      const optionAddress = registry.interface.parseLog(log).args.optionAddress
      optionAddresses.push(optionAddress)
    }

    return optionAddresses
  }

  public static async getPairsFromMultiCall(
    provider,
    tokensArray
  ): Promise<any> {
    const multi = new MultiCall(provider)

    let chunks = Protocol.chunkArray(tokensArray, 30)
    let datas = []
    let pairAddresses = []
    for (let chunk of chunks) {
      let inputs = []
      for (let tokenArray of chunk) {
        inputs.push({
          target: FACTORY_ADDRESS,
          function: 'getPair',
          args: [tokenArray[0], tokenArray[1]],
        })
      }
      const pairData = await multi.multiCall(UniswapV2Factory.abi, inputs)
      datas.push(pairData)
    }

    for (let data of datas) {
      pairAddresses = pairAddresses.concat(data)
    }
    return pairAddresses
  }

  public static async getReservesFromMultiCall(
    provider,
    pairAddresses
  ): Promise<any> {
    const multi = new MultiCall(provider)
    let chunks = Protocol.chunkArray(pairAddresses, 30)
    let datas = []
    let pairDatas = []
    for (let chunk of chunks) {
      let inputs = []
      for (const pair of chunk) {
        inputs.push({
          target: pair,
          function: 'getReserves',
          args: [],
        })
        inputs.push({
          target: pair,
          function: 'token0',
          args: [],
        })
        inputs.push({
          target: pair,
          function: 'token1',
          args: [],
        })
      }
      // pairDatas[i] = pair reserves
      // pair reserves = [reserve0, reserve1]
      const pairData = await multi.multiCall(UniswapV2Pair.abi, inputs)
      datas.push(pairData)
    }

    for (let data of datas) {
      pairDatas = pairDatas.concat(data)
    }

    return pairDatas
  }

  public static async getRegistry(signer): Promise<ethers.Contract> {
    const chain = await signer.getChainId()
    const registryAddress = this.getRegistryAddress(chain)
    const registry = new ethers.Contract(registryAddress, Registry.abi, signer)
    return registry
  }

  public static async getOptionsUsingMultiCall(
    chainId: number,
    optionAddresses: string[],
    provider: ethers.providers.Provider
  ): Promise<any> {
    let parameters
    try {
      parameters = await Protocol.getOptionParametersFromMultiCall(
        provider,
        optionAddresses
      )
    } catch (e) {
      console.log(e)
    }

    const optionsEntityObject: any = {}

    // parameters = [array of option's parameters]
    for (let i = 0; i < parameters.length; i++) {
      const parameter = parameters[i]
      // parameter = [optionParameters]
      const tokens = [parameter[0], parameter[1], parameter[2]]
      // metadata for each token in tokens
      try {
        const tokensData = await Protocol.getTokensMetadataFromMultiCall(
          provider,
          tokens
        )
        // assets = [Underlying, Strike, Redeem]
        const assets: Token[] = []
        // tokenData = [name, symbol, decimals] for each token
        // for each set of tokens (tokensData[0-2]), grab the details.
        for (let t = 0; t < tokensData.length / 3; t++) {
          const startIndex = t * 3
          const address = tokens[t]
          const decimals = tokensData[startIndex + 2]
          const symbol = tokensData[startIndex + 1]
          const name = tokensData[startIndex]
          console.log({ name, symbol })
          assets.push(new Token(chainId, address, decimals, symbol, name))
        }
        const optionParams: OptionParameters = {
          base: new TokenAmount(assets[0], parameter[3]),
          quote: new TokenAmount(assets[1], parameter[4]),
          expiry: parameter[5],
        }

        const optionEntity: Option = new Option(
          optionParams,
          chainId,
          optionAddresses[i],
          18,
          'Primitive V1 Option',
          'PRM'
        )
        optionEntity.tokenAddresses = tokens
        Object.assign(optionsEntityObject, {
          [optionAddresses[i]]: optionEntity,
        })
      } catch (e) {
        console.log(e)
      }
    }
    return optionsEntityObject
  }

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
      TestERC20.abi,
      provider
    )
    const strike: ethers.Contract = new ethers.Contract(
      parameters._strikeToken,
      TestERC20.abi,
      provider
    )

    const optionParameters: OptionParameters = {
      base: new TokenAmount(
        new Token(
          await underlying.decimals(),
          await underlying.name(),
          await underlying.symbol()
        ),
        parameters._base
      ),
      quote: new TokenAmount(
        new Token(
          await strike.decimals(),
          await strike.name(),
          await strike.symbol()
        ),
        parameters._quote
      ),
      expiry: parameters._expiry,
    }

    const optionEntity: Option = new Option(
      optionParameters,
      chainId,
      address,
      18,
      'Primitive V1 Option',
      'PRM'
    )

    optionEntity.tokenAddresses = await new ethers.Contract(
      address,
      OptionContract.abi,
      provider
    ).getTokenAddresses()

    return optionEntity
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
