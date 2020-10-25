import ERC20 from '@primitivefi/contracts/artifacts/ERC20.json'
import TestERC20 from '@primitivefi/contracts/artifacts/TestERC20.json'
import Option from '@primitivefi/contracts/artifacts/Option.json'
import Trader from '@primitivefi/contracts/artifacts/Trader.json'
import Registry from '@primitivefi/contracts/artifacts/Registry.json'
import TraderRinkeby from '@primitivefi/contracts/deployments/rinkeby/Trader.json'
import RegistryRinkeby from '@primitivefi/contracts/deployments/rinkeby/Registry.json'
import { ethers } from 'ethers'

import { SinglePositionParameters } from '../lib/uniswap'

import { parseEther } from 'ethers/lib/utils'

import Assets from '../contexts/Options/assets.json'

const MIN_ALLOWANCE = parseEther('10000000')

const mintTestToken = async (signer, optionAddress, quantity) => {
  const option = new ethers.Contract(optionAddress, Option.abi, signer)
  const underlyingAddress = await option.getUnderlyingTokenAddress()
  const strikeAddress = await option.getStrikeTokenAddress()
  const underlyingToken = new ethers.Contract(
    underlyingAddress,
    TestERC20.abi,
    signer
  )
  const strikeToken = new ethers.Contract(strikeAddress, TestERC20.abi, signer)
  const account = await signer.getAddress()
  const mintQuantity = parseEther(quantity.toString()).toString()
  let tx
  try {
    tx = await underlyingToken.mint(account, mintQuantity)
    await strikeToken.mint(account, mintQuantity)
  } catch (err) {
    console.log('Error when minting test token: ', err)
  }

  return tx
}

const checkAllowance = async (signer, tokenAddress, spenderAddress) => {
  const token = new ethers.Contract(tokenAddress, ERC20.abi, signer)
  const owner = await signer.getAddress()
  const allowance = await token.allowance(owner, spenderAddress)
  if (allowance < MIN_ALLOWANCE) {
    await token.approve(spenderAddress, MIN_ALLOWANCE)
  }
}

const getTraderAddress = (chainId) => {
  let address
  if (chainId.toString() === '4') {
    address = TraderRinkeby.address
  }

  return address
}

const getRegistryAddress = (chainId) => {
  let address
  if (chainId.toString() === '4') {
    address = RegistryRinkeby.address
  }

  return address
}

const getTrader = async (signer) => {
  const chain = await signer.getChainId()
  const traderAddress = getTraderAddress(chain)
  const trader = new ethers.Contract(traderAddress, Trader.abi, signer)
  return { traderAddress, trader }
}

const getRegistry = async (signer) => {
  const chain = await signer.getChainId()
  const registryAddress = getRegistryAddress(chain)
  const registry = new ethers.Contract(registryAddress, Registry.abi, signer)
  return { registryAddress, registry }
}

const mint = async (signer, quantity, optionAddress) => {
  const account = await signer.getAddress()
  const { traderAddress, trader } = await getTrader(signer)
  const option = new ethers.Contract(optionAddress, Option.abi, signer)
  const underlyingAddress = await option.getUnderlyingTokenAddress()
  const mintQuantity = parseEther(quantity.toString()).toString()

  await checkAllowance(signer, underlyingAddress, traderAddress)

  let tx
  try {
    tx = await trader.safeMint(optionAddress, mintQuantity, account)
  } catch (err) {
    console.log('Error on minting: ', err)
  }

  console.log(tx)
  return tx
}

const exercise = async (signer, quantity, optionAddress) => {
  const account = await signer.getAddress()
  const { traderAddress, trader } = await getTrader(signer)
  const option = new ethers.Contract(optionAddress, Option.abi, signer)
  const strikeAddress = await option.getStrikeTokenAddress()
  const exerciseQuantity = parseEther(quantity.toString()).toString()

  await checkAllowance(signer, strikeAddress, traderAddress)
  await checkAllowance(signer, optionAddress, traderAddress)

  let tx
  try {
    tx = await trader.safeExercise(optionAddress, exerciseQuantity, account)
  } catch (err) {
    console.log('Error on exercising: ', err)
  }

  return tx
}

const redeem = async (signer, quantity, optionAddress) => {
  const account = await signer.getAddress()
  const { traderAddress, trader } = await getTrader(signer)
  const option = new ethers.Contract(optionAddress, Option.abi, signer)
  const redeemAddress = await option.redeemToken()
  const redeemQuantity = parseEther(quantity.toString()).toString()

  await checkAllowance(signer, redeemAddress, traderAddress)

  let tx
  try {
    tx = await trader.safeRedeem(optionAddress, redeemQuantity, account)
  } catch (err) {
    console.log('Error on redeeming: ', err)
  }

  return tx
}

const close = async (signer, quantity, optionAddress) => {
  const account = await signer.getAddress()
  const { traderAddress, trader } = await getTrader(signer)
  const option = new ethers.Contract(optionAddress, Option.abi, signer)
  const redeemAddress = await option.redeemToken()
  const closeQuantity = parseEther(quantity.toString()).toString()

  await checkAllowance(signer, redeemAddress, traderAddress)
  await checkAllowance(signer, optionAddress, traderAddress)

  let tx
  try {
    tx = await trader.safeClose(optionAddress, closeQuantity, account)
  } catch (err) {
    console.log('Error on closing: ', err)
  }

  return tx
}

const create = async (signer, underlying, isCallType, expiry, strike) => {
  const chain = await signer.getChainId()
  const { registryAddress, registry } = await getRegistry(signer)
  const stablecoin = Assets['dai'][chain]

  /* 
     
     * @dev Deploys an option contract clone with create2.
     * @param underlyingToken The address of the ERC-20 underlying token.
     * @param strikeToken The address of the ERC-20 strike token.
     * @param base The quantity of underlying tokens per unit of quote amount of strike tokens.
     * @param quote The quantity of strike tokens per unit of base amount of underlying tokens.
     * @param expiry The unix timestamp of the option's expiration date.
     * @return The address of the deployed option clone.
        function deployOption(
            address underlyingToken,
            address strikeToken,
            uint256 base,
            uint256 quote,
            uint256 expiry
        )
    */

  let underlyingToken = ''
  let strikeToken = ''
  let base = '0'
  let quote = '0'

  if (isCallType) {
    underlyingToken = underlying
    strikeToken = stablecoin
    base = parseEther('1').toString()
    quote = parseEther(strike.toString()).toString()
  } else {
    underlyingToken = stablecoin
    strikeToken = underlying
    base = parseEther(strike.toString()).toString()
    quote = parseEther('1').toString()
  }

  let tx
  try {
    tx = await registry.deployOption(
      underlyingToken,
      strikeToken,
      base,
      quote,
      expiry
    )
  } catch (err) {
    console.log('Error on creating: ', err)
    return err
  }

  console.log('Deployed option tx: ', tx, { registryAddress })
  return tx
}

const getOptionMarkets = async (options) => {
  const markets = Object.keys(options.contracts)
    .filter((contract) => contract.indexOf('_market') !== -1)
    .reduce((accumulator, current) => {
      const newAccumulator = { ...accumulator }
      newAccumulator[current] = options.contracts[current]
      return newAccumulator
    }, {})
  return markets
}

const executeTransaction = async (
  signer: any,
  transaction: SinglePositionParameters
): Promise<any> => {
  let tx: any = {}
  console.log(transaction)
  let args = transaction.args
  let path = args[2]
  let token0 = path[0]

  await checkAllowance(signer, token0, transaction.contract.address)
  try {
    tx = await transaction.contract[transaction.methodName](...args, {
      value: transaction.value,
    })
  } catch (err) {
    console.error(
      `Issue when attempting to submit transaction: ${transaction.methodName}`
    )
  }

  return tx
}

export {
  executeTransaction,
  mint,
  exercise,
  redeem,
  close,
  create,
  mintTestToken,
  getOptionMarkets,
}
