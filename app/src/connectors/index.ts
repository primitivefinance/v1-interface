// Simplified from https://github.com/Uniswap/uniswap-interface/blob/master/src/connectors/index.ts
import { NetworkConnector } from '@web3-react/network-connector'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { INFURA_PREFIXES } from '../utils/index'

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
})

// no coinbase testnet, requires infura mainnet node URL
export const walletconnect = new WalletConnectConnector({
  rpc: {
    1: `https://${INFURA_PREFIXES[1]}.infura.io/v3/${process.env.INFURA_ID}`,
  },
  bridge: 'https://bridge.walletconnect.org',
})

export function getNetwork(defaultChainId = 1): NetworkConnector {
  return new NetworkConnector({
    urls: [1, 4].reduce(
      (urls, chainId) =>
        Object.assign(urls, {
          [chainId]: `https://${INFURA_PREFIXES[chainId]}.infura.io/v3/${process.env.INFURA_ID}`,
        }),
      {}
    ),
    defaultChainId,
  })
}
