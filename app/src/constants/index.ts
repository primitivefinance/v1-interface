import { AbstractConnector } from '@web3-react/abstract-connector'

import { injected, walletconnect } from '../connectors'

export interface Wallet {
  connector: AbstractConnector
  name: string
  icon: string
}

// Uniswap Token Interface
export interface Token {
  name: string
  address: string
  symbol: string
  decimals: number
  chainId: number
  logoURI: string
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

export const MARKETS: Market[] = [
  {
    name: 'WETH',
    icon:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/1280px-Ethereum-icon-purple.svg.png',
    id: 'weth',
    sort: 2,
  },
  {
    name: 'Soon...',
    icon: '',
    id: 'tbd',
    sort: 1,
  },
  {
    name: 'Soon...',
    icon: '',
    id: 'tbd',
    sort: 0,
  },
]

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

export const CURRENT_VERSION = 1.0
export const NO_VERSION = -1
export const DEFAULT_DEADLINE = 60 * 20
export const DEFAULT_SLIPPAGE = 50
