import { AbstractConnector } from '@web3-react/abstract-connector'
import { Asset } from '../lib/entities/asset'
import { ChainId, JSBI, Percent, Token, WETH } from '@uniswap/sdk'
import { parseEther } from 'ethers/lib/utils'

import { injected, walletconnect } from '../connectors'

export interface Wallet {
  connector: AbstractConnector
  name: string
  icon: string
}

export interface Market {
  name: string
  icon: string
  id: string
  sort: number
  address: string
}

export const WALLETS: { [key: string]: Wallet } = {
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    icon: 'https://gitcoin.co/dynamic/avatar/MetaMask',
  },
  COINBASE: {
    connector: walletconnect,
    name: 'Coinbase Wallet',
    icon:
      'https://lh3.googleusercontent.com/3pwxYyiwivFCYflDJtyWDnJ3ZgYuN_wBQBHqCXbKh9tJTdTL1uOrY1VyxeC_yXLTNZk',
  },
}

export const NAME_FOR_MARKET: { [key: string]: string } = {
  yfi: 'Yearn',
  eth: 'Wrapped ETH',
  sushi: 'Sushi',
  uni: 'Uniswap',
  comp: 'Compound',
  link: 'Link',
  aave: 'Aave',
  snx: 'Synthetix',
  mkr: 'Maker',
}

export const SORT_FOR_MARKET: { [key: string]: number } = {
  yfi: 0,
  eth: 1,
  sushi: 2,
  comp: 3,
  uni: 4,
  link: 5,
  aave: 6,
  snx: 7,
  mkr: 8,
}

export const COINGECKO_ID_FOR_MARKET: { [key: string]: string } = {
  yfi: 'yearn-finance',
  eth: 'weth',
  sushi: 'sushi',
  comp: 'compound-governance-token',
  uni: 'uniswap',
  link: 'chainlink',
  aave: 'aave',
  snx: 'havven',
  mkr: 'maker',
}

export const ADDRESS_FOR_MARKET: { [key: string]: string } = {
  yfi: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  eth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  sushi: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
  comp: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  uni: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  link: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  aave: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  snx: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
  mkr: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
}

export const MARKETS: Market[] = Object.keys(SORT_FOR_MARKET).map(
  (key): Market => {
    return {
      name: NAME_FOR_MARKET[key],
      icon: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${ADDRESS_FOR_MARKET[key]}/logo.png`,
      id: key,
      sort: SORT_FOR_MARKET[key],
      address: ADDRESS_FOR_MARKET[key],
    }
  }
)

export const getIconForMarket = (key) => {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${ADDRESS_FOR_MARKET[key]}/logo.png`
}

export enum QueryParameters {
  INPUT = 'input',
  OUTPUT = 'output',
  CHAIN = 'chain',
}

export enum LocalStorageKeys {
  Version = 'version',
  Deadline = 'deadline',
  Slippage = 'slippage',
  Transactions = 'transactions',
  Stablecoin = 'stablecoin',
  LoadingPositions = 'loadposition',
  EmptyPositions = 'emptyposition',
}

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const UNI_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

export const ASSETS: { [key: string]: Asset } = {
  ['DAI']: new Asset(18, 'Dai Stablecoin', 'DAI'),
  ['USDC']: new Asset(18, 'USD Coin', 'USDC'),
  ['sUSD']: new Asset(18, 'Synth USD', 'sUSD'),
  ['USDT']: new Asset(18, 'USD Tether', 'USDT'),
}

export const getToken = (chainId: ChainId, address: string, asset: Asset) => {
  return new Token(chainId, address, asset.decimals, asset.symbol, asset.symbol)
}

export const STABLECOINS: { [key: number]: Token } = {
  1: getToken(
    ChainId.MAINNET,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    ASSETS.DAI
  ),
  4: getToken(
    ChainId.RINKEBY,
    '0x95b58a6bff3d14b7db2f5cb5f0ad413dc2940658',
    ASSETS.DAI
  ),
}

export const DEFAULT_STRIKE_LOW = 0.9
export const DEFAULT_STRIKE_MID = 1.0
export const DEFAULT_STRIKE_HIGH = 1.1

export const CURRENT_VERSION = 1.0
export const NO_VERSION = -1
export const DEFAULT_DEADLINE = 60 * 20
export const DEFAULT_SLIPPAGE = '0.01'
export const DEFAULT_TIMELIMIT = 60 * 20
export const ETHERSCAN_MAINNET = 'https://etherscan.io/address'
export const ETHERSCAN_RINKEBY = 'https://rinkeby.etherscan.io/address'

export const DEFAULT_ALLOWANCE = parseEther('10000000')

export enum Operation {
  MINT,
  EXERCISE,
  REDEEM,
  CLOSE,
  UNWIND,
  LONG,
  SHORT,
  CLOSE_LONG,
  CLOSE_SHORT,
  NEUTRAL,
  ADD_LIQUIDITY,
  REMOVE_LIQUIDITY,
  REMOVE_LIQUIDITY_CLOSE,
  NEW_MARKET,
  NONE,
}
