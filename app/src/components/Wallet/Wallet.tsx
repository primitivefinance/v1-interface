import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  forwardRef,
  Suspense,
} from 'react'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import {
  WalletConnectConnector,
  UserRejectedRequestError,
} from '@web3-react/walletconnect-connector'
import { useRouter } from 'next/router'
import MetaMaskOnboarding from '@metamask/onboarding'

import Button from '@/components/Button'
import Box from '@/components/Box'
import Loader from '@/components/Loader'
import Spacer from '@/components/Spacer'

import { injected, walletconnect, getNetwork } from '../../connectors'

import { usePrevious, useQueryParameters, useClickAway } from '@/hooks/utils'
import { useETHBalance } from '@/hooks/data'
import { useEagerConnect } from '@/hooks/user'

import { WALLETS, QueryParameters } from '../../constants'

import { Network } from './Network'
import { AddressButton } from './AddressButton'

export const Wallet = () => {
  const {
    active,
    chainId,
    account,
    connector,
    activate,
    library,
    error,
    setError,
  } = useWeb3React()

  const triedToEagerConnect = useEagerConnect()
  const router = useRouter()
  const { data } = useETHBalance(account, false)
  const balance = data

  const onboarding = useRef<MetaMaskOnboarding>()
  useLayoutEffect(() => {
    onboarding.current = new MetaMaskOnboarding()
  }, [])

  // automatically try connecting to the network connector where applicable
  const queryParameters = useQueryParameters()
  const requiredChainId = queryParameters[QueryParameters.CHAIN]
  useEffect(() => {
    if (triedToEagerConnect && !active && !error) {
      activate(getNetwork(requiredChainId))
    }
  }, [triedToEagerConnect, active, error, requiredChainId, activate])

  // manage connecting state for injected connector
  const [connecting, setConnecting] = useState(false)
  useEffect(() => {
    if (active || error) {
      setConnecting(false)
      onboarding.current?.stopOnboarding()
    }
  }, [active, error, triedToEagerConnect])

  const [ENSName, setENSName] = useState('')
  useEffect(() => {
    if (library && account) {
      let stale = false
      library
        .lookupAddress(account)
        .then((name) => {
          if (!stale && typeof name === 'string') {
            setENSName(name)
          }
        })
        .catch((error) => console.log(error)) // eslint-disable-line @typescript-eslint/no-empty-function
      return (): void => {
        stale = true
        setENSName('')
      }
    }
  }, [library, account, chainId])

  if (error) {
    return (
      <>
        {error instanceof UnsupportedChainIdError ? (
          <h5>Unsupported Chain</h5>
        ) : (
          <Button
            variant="secondary"
            isLoading={connecting}
            leftIcon={
              MetaMaskOnboarding.isMetaMaskInstalled()
                ? ('metamask' as 'edit')
                : undefined
            }
            onClick={(): void => {
              setConnecting(true)
              activate(injected, undefined, true).catch((error) => {
                // ignore the error if it's a user rejected request
                if (error instanceof UserRejectedRequestError) {
                  setConnecting(false)
                } else {
                  setError(error)
                }
              })
            }}
          >
            {MetaMaskOnboarding.isMetaMaskInstalled()
              ? 'Connect to MetaMask'
              : 'Connect to Wallet'}
          </Button>
        )}
      </>
    )
  }
  if (!triedToEagerConnect) {
    return <Loader />
  }
  if (typeof account !== 'string') {
    return (
      <Box row alignItems="center" justifyContent="flex-end">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {MetaMaskOnboarding.isMetaMaskInstalled() ||
        (window as any)?.ethereum ||
        (window as any)?.web3 ? (
          <Button
            variant="secondary"
            isLoading={connecting}
            leftIcon={
              MetaMaskOnboarding.isMetaMaskInstalled()
                ? ('metamask' as 'edit')
                : undefined
            }
            onClick={(): void => {
              setConnecting(true)
              activate(injected, undefined, true).catch((error) => {
                // ignore the error if it's a user rejected request
                if (error instanceof UserRejectedRequestError) {
                  setConnecting(false)
                } else {
                  setError(error)
                }
              })
            }}
          >
            {MetaMaskOnboarding.isMetaMaskInstalled()
              ? 'Connect to MetaMask'
              : 'Connect to Wallet'}
          </Button>
        ) : (
          <Button
            leftIcon={'metamask' as 'edit'}
            onClick={() => onboarding.current?.startOnboarding()}
          >
            Install Metamask
          </Button>
        )}
      </Box>
    )
  }

  let leftIcon: string | undefined
  // check walletconnect first because sometime metamask can be installed but we're still using walletconnect
  if ((library?.provider as { isWalletConnect: boolean })?.isWalletConnect) {
    leftIcon = 'walletconnect'
  } else if (MetaMaskOnboarding.isMetaMaskInstalled()) {
    leftIcon = 'metamask'
  }

  return (
    <Box row alignItems="center" justifyContent="flex-end">
      <Network id={chainId} />
      <Spacer size="md" />
      <AddressButton
        network={chainId}
        address={ENSName || account}
        method={connector}
      />
    </Box>
  )
}
