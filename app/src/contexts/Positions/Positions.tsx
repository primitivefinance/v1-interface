import React, { useCallback, useReducer } from 'react'
import { formatEther } from 'ethers/lib/utils'

import { useWeb3React } from '@web3-react/core'

import ERC20 from '@primitivefi/contracts/artifacts/TestERC20.json'

import PositionsContext from './context'
import positionsReducer, { initialState, setPositions } from './reducer'
import { EmptyPositionsAttributes, PositionsAttributes } from './types'
import { ethers } from 'ethers'

const Positions: React.FC = (props) => {
  const [state, dispatch] = useReducer(positionsReducer, initialState)

  // Web3 injection
  const { library } = useWeb3React()
  const provider = library

  const handlePositions = useCallback(
    async (assetName: string, options) => {
      // Web3 variables
      const signer = await provider.getSigner()
      const account = await signer.getAddress()

      const positionsObject = {
        calls: [EmptyPositionsAttributes],
        puts: [EmptyPositionsAttributes],
      }

      const calls: PositionsAttributes[] = []
      const puts: PositionsAttributes[] = []
      const optionCallsLength: number = options.calls.length
      const optionPutsLength: number = options.puts.length

      for (let i = 0; i < optionCallsLength; i++) {
        // for each call, populate the positions object.
        let name
        let symbol
        let address
        let balance

        name = options.calls[i].id
        address = options.calls[i].address
        const option = new ethers.Contract(address, ERC20.abi, signer)
        symbol = await option.symbol()
        balance = Number(formatEther(await option.balanceOf(account)))

        calls.push({
          name: name,
          symbol: symbol,
          address: address,
          balance: balance,
        })
      }

      for (let i = 0; i < optionPutsLength; i++) {
        // for each call, populate the positions object.
        let name
        let symbol
        let address
        let balance

        name = options.puts[i].id
        address = options.puts[i].address

        const option = new ethers.Contract(address, ERC20.abi, signer)
        symbol = await option.symbol()
        balance = Number(formatEther(await option.balanceOf(account)))

        puts.push({
          name: name,
          symbol: symbol,
          address: address,
          balance: balance,
        })
      }

      Object.assign(positionsObject, {
        calls: calls,
        puts: puts,
      })

      dispatch(setPositions(positionsObject))
    },
    [dispatch, provider]
  )

  return (
    <PositionsContext.Provider
      value={{
        positions: state.positions,
        getPositions: handlePositions,
      }}
    >
      {props.children}
    </PositionsContext.Provider>
  )
}

export default Positions
