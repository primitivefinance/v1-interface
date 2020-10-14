// Simplified from https://github.com/Uniswap/uniswap-interface/blob/master/src/connectors/index.ts

import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

const NETWORK_URL = process.env.NETWORK_URL || ''

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42]
})

// no coinbase testnet, requires infura mainnet node URL
export const walletconnect = new WalletConnectConnector({
  rpc: { 1: NETWORK_URL },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 15000
})
