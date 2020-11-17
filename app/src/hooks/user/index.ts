import { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { useWeb3React } from '@web3-react/core'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { Web3Provider } from '@ethersproject/providers'

import { useLocalStorage } from '../utils/useLocalStorage'
import { injected } from '../../connectors'
import { LocalStorageKeys, DEFAULT_SLIPPAGE } from '../../constants'

import { TradeSettings } from '@/lib/types'
import {
  DEFAULT_DEADLINE,
  DEFAULT_TIMELIMIT,
  STABLECOINS,
} from '@/constants/index'

declare global {
  interface Window {
    ethereum: any
  }
}

// https://github.com/Uniswap/uniswap-interface/blob/master/src/hooks/index.ts
export function useSlippage() {
  return useLocalStorage<string>(LocalStorageKeys.Slippage, DEFAULT_SLIPPAGE)
}

export function useTradeSettings(): TradeSettings {
  const [slippage] = useSlippage()
  const { account, chainId } = useWeb3React()
  const tradeSettings: TradeSettings = {
    slippage: slippage,
    timeLimit: DEFAULT_TIMELIMIT,
    receiver: account,
    deadline: DEFAULT_DEADLINE,
    stablecoin: STABLECOINS[chainId]?.address,
  }
  return tradeSettings
}

export function useActiveWeb3React(): Web3ReactContextInterface<
  Web3Provider
> & { chainId?: any } {
  const context = useWeb3React<Web3Provider>()
  const contextNetwork = useWeb3React<Web3Provider>()
  return context.active ? context : contextNetwork
}

export function useEagerConnect() {
  const { activate, active } = useWeb3React()
  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        setTried(true)
      }
    })
  }, [activate])

  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}

export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React()
  const router = useRouter()
  useEffect(() => {
    const { ethereum } = window

    const handleChainChanged = () => {
      // eat errors
      activate(injected, undefined, true)
        .catch((error) => {
          console.error('Failed to activate after chain changed', error)
        })
        .finally(() => {
          router.reload()
        })
    }

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        // eat errors
        activate(injected, undefined, true).catch((error) => {
          console.error('Failed to activate after accounts changed', error)
        })
      }
    }

    ethereum.on('chainChanged', handleChainChanged)
    ethereum.on('accountsChanged', handleAccountsChanged)
    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener('chainChanged', handleChainChanged)
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [active, error, suppress, activate])
}
