import { AbstractConnector } from '@web3-react/abstract-connector'
import { ChainId, JSBI, Percent, Token, WETH } from '@uniswap/sdk'

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
  yfi_pool: 'YFI',
  eth_pool: 'Weth',
  sushi_pool: 'Sushi',
  uni_pool: 'Uniswap',
  comp_pool: 'Compound',
  link_pool: 'Link',
  aave_pool: 'Aave',
  snx_pool: 'Synthetix',
  mkr_pool: 'Maker',
}

export const SORT_FOR_MARKET: { [key: string]: number } = {
  yfi_pool: 0,
  eth_pool: 1,
  sushi_pool: 2,
  comp_pool: 3,
  uni_pool: 4,
  link_pool: 5,
  aave_pool: 6,
  snx_pool: 7,
  mkr_pool: 8,
}

export const ADDRESS_FOR_MARKET: { [key: string]: string } = {
  yfi_pool: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  eth_pool: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  sushi_pool: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
  comp_pool: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  uni_pool: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  link_pool: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  aave_pool: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  snx_pool: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
  mkr_pool: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
}

export const MARKETS: Market[] = Object.keys(SORT_FOR_MARKET).map(
  (key): Market => {
    return {
      name: NAME_FOR_MARKET[key],
      icon: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${ADDRESS_FOR_MARKET[key]}/logo.png`,
      id: key,
      sort: SORT_FOR_MARKET[key],
    }
  }
)

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
}

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const UNI_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

export const DAI = new Token(
  ChainId.MAINNET,
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  18,
  'DAI',
  'Dai Stablecoin'
)

export const CURRENT_VERSION = 1.0
export const NO_VERSION = -1
export const DEFAULT_DEADLINE = 60 * 20
export const DEFAULT_SLIPPAGE = '50'
export const DEFAULT_TIMELIMIT = 60 * 20
