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
