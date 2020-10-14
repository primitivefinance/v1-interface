import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useLocalStorage } from '../utils/useLocalStorage'
import { injected } from '../../connectors'
import { LocalStorageKeys } from '../../constants'

declare global {
  interface Window {
      ethereum: any
  }
}

export function useDarkMode() {
  return useLocalStorage<boolean>(LocalStorageKeys.DarkMode, false)
}

// https://github.com/Uniswap/uniswap-interface/blob/master/src/hooks/index.ts
export function useEagerConnect() {
  const { activate, active } = useWeb3React()
  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then(isAuthorized => {
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

  useEffect(() => {
    const { ethereum } = window

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch(error => {
          console.error('Failed to activate after chain changed', error)
        })
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch(error => {
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
    }
    return undefined
  }, [active, error, suppress, activate])
}