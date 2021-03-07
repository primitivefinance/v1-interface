import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import { Grid, Col, Row } from 'react-styled-flexboxgrid'

import IconButton from '@/components/IconButton'
import Button from '@/components/Button'
import Tooltip from '@/components/Tooltip'
import Box from '@/components/Box'
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
import TableCell from '@/components/TableCell'
import TableRow from '@/components/TableRow'
import LitContainer from '@/components/LitContainer'
import Spacer from '@/components/Spacer'
import MetaMaskOnboarding from '@metamask/onboarding'
import { useRouter } from 'next/router'
import { useActiveWeb3React } from '@/hooks/user/index'
import { PRIMITIVE_ROUTER } from '@primitivefi/sdk'
import SushiSwapConnectorABI from '@primitivefi/v1-connectors/deployments/live/UniswapConnector03.json'
import ethers from 'ethers'

export interface SpecificationMetaData {
  score: string
  name: string
  id: string
}

export const ADDRESS: { [key: string]: string } = {
  '0x152Ac2bC1821C5C9ecA56D1F35D8b0D8b61187F5': 'alexangel.eth',
  zero: 'zero',
}

export const SCORE: { [key: string]: string } = {
  '0x152Ac2bC1821C5C9ecA56D1F35D8b0D8b61187F5': '1337',
  zero: 'zero',
}

export const SPECIFICATIONS: SpecificationMetaData[] = Object.keys(ADDRESS).map(
  (key): SpecificationMetaData => {
    return {
      name: ADDRESS[key],
      score: SCORE[key],
      id: key,
    }
  }
)

const getConnector = async (signer): Promise<ethers.Contract> => {
  const chain = await signer.getChainId()
  const connectorAddr = PRIMITIVE_ROUTER[chain].address
  const registry = new ethers.Contract(
    connectorAddr,
    SushiSwapConnectorABI.abi,
    signer
  )
  return registry
}

const getAddressFromEvent = async (
  provider,
  contract,
  event,
  eventArgs
): Promise<any> => {
  const filter: any = contract.filters[event](...eventArgs)
  filter.fromBlock = 7200000 // we can set a better start block later
  filter.toBlock = 'latest'

  let fromAddresses: string[] = []
  const logs = await provider.getLogs(filter)
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]
    console.log(contract.interface.parseLog(log).args)
    const from = contract.interface.parseLog(log).args.to
    fromAddresses.push(from)
  }
  return fromAddresses
}

const EVENTS = {
  FlashOpened: [null, null, null],
  FlashClosed: [null, null, null],
  WroteOption: [null, null],
  Transfer: [null, null, null],
}

const getAllFromAddresses = async (provider): Promise<any> => {
  const signer = await provider.getSigner()
  const connector = await getConnector(signer)
  let fromAddresses: string[] = []
  const eventKeys = Object.keys(EVENTS)
  for (let i = 0; i < eventKeys.length; i++) {
    // get the from addresses for the event
    let key = eventKeys[i]
    let args = EVENTS[key]
    let addresses = await getAddressFromEvent(provider, connector, key, args)
    fromAddresses.push(addresses)
  }

  console.log(fromAddresses)
  return fromAddresses
}

const LeaderboardTable: React.FC = () => {
  const { chainId, active, account, library } = useActiveWeb3React()
  const [id, storeId] = useState(chainId)
  const [changing, setChanging] = useState(false)
  const router = useRouter()
  useEffect(() => {
    const { ethereum, web3 } = window as any

    if (MetaMaskOnboarding.isMetaMaskInstalled() && (!ethereum || !web3)) {
      router.reload()
    }
    if (ethereum) {
      const handleChainChanged = () => {
        if (id !== chainId) {
          setChanging(true)
          storeId(chainId)
          // eat errors
          router.reload()
        }
      }
      const handleAccountChanged = () => {
        router.reload()
      }
      if (ethereum?.on) {
        ethereum?.on('chainChanged', handleChainChanged)
        ethereum?.on('accountsChanged', handleAccountChanged)
      }
      return () => {
        if (ethereum?.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountChanged)
        }
      }
    }
  }, [id, chainId, storeId])

  const handleOnClick = useCallback(async () => {
    if (library) {
      let fromAddresses = await getAllFromAddresses(library)
    }
  }, [library, getAllFromAddresses])
  return (
    <StyledFAQ>
      <Spacer />
      <Spacer />
      <StyledTitle>Leaderboard {account}</StyledTitle>
      <Spacer />
      <Button text="Get Addresses" onClick={handleOnClick} />
      <Spacer />
      <StyledTableBody>
        <Spacer size="sm" />
        {SPECIFICATIONS.map((specification, i) => {
          return (
            <>
              <TableRow key={i} isHead align="top" height={84}>
                <TableCell>
                  <StyledName>{specification.name}</StyledName>
                </TableCell>
                <Spacer />
                <TableCell>
                  <StyledSub>{specification.score}</StyledSub>
                </TableCell>
              </TableRow>
              <StyledDivLight />
              <Spacer size="sm" />
            </>
          )
        })}
      </StyledTableBody>
      <Spacer />
      <Spacer />
    </StyledFAQ>
  )
}

const StyledDiv = styled.div`
  border: 1px solid ${(props) => props.theme.color.grey[600]};
`

const StyledDivLight = styled.div`
  border: 1px solid ${(props) => props.theme.color.grey[800]};
`

const StyledTableBody = styled(TableBody)`
  width: 100%;
`
const StyledSub = styled.span`
  color: white;
  opacity: 0.66;
`
const StyledName = styled.span`
  color: white;
  font-weight: bold;
`
const StyledTitle = styled.div`
  color: white;
  font-weight: bold;
  font-size: 36px;
  width: 100%;
`
const StyledFAQ = styled.div`
  align-items: left;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
  max-width: 1000px;
  margin: 0 2em 0 2em;
`
export default LeaderboardTable
