import React, { useCallback, useReducer } from 'react'

import OrderContext from './context'

import reducer, { addItem, initialState, changeItem } from './reducer'

import { OrderItem, OrderType } from './types'
import { Web3Provider } from '@ethersproject/providers'

import { useWeb3React } from '@web3-react/core'

import UniswapPairs from './uniswap_pairs.json'
import {
  Uniswap,
  TradeSettings,
  SinglePositionParameters,
} from '../../lib/uniswap'
import { Option, OptionParameters } from '../../lib/entities/option'
import { Trade } from '../../lib/entities'
import { Quantity } from '../../lib/entities'
import { Asset } from '../../lib/entities'
import { Direction, Operation } from '../../lib/constants'

import useTransactions from '@/hooks/transactions/index'

import {
  mint,
  exercise,
  redeem,
  close,
  create,
  mintTestToken,
  executeTransaction,
} from '../../lib/primitive'

import {
  DEFAULT_SLIPPAGE,
  DEFAULT_DEADLINE,
  DEFAULT_TIMELIMIT,
} from '../../constants/index'
import { exec } from 'child_process'

const Order: React.FC = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { library, chainId, account } = useWeb3React()
  const { addTransaction } = useTransactions()
  const now = () => new Date().getTime()

  /* const networkIdToUrl = {
    '1': 'https://etherscan.io/tx',
    '4': 'https://rinkeby.etherscan.io/tx',
  } */

  /* const addEtherscan = (transaction) => {
    return {
      message: '',
      onclick: () =>
        window.open(`${networkIdToUrl[chainId || 1]}/${transaction.hash}`),
    }
  } */

  const handleAddItem = useCallback(
    (item: OrderItem, orderType: OrderType) => {
      dispatch(addItem(item, orderType))
    },
    [dispatch]
  )

  const handleChangeItem = useCallback(
    (item: OrderItem, orderType: OrderType) => {
      dispatch(changeItem(item, orderType))
    },
    [dispatch]
  )

  const handleBuyOptions = async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => {
    const stablecoinAddress = UniswapPairs[state.item.id].stablecoinAddress
    const pairAddress = UniswapPairs[state.item.id].pairAddress
    const signer = await provider.getSigner()
    const receiver = await signer.getAddress()

    const base: Quantity = new Quantity(new Asset(18), '10')
    const quote: Quantity = new Quantity(new Asset(18), '10')
    const expiry: number = 10
    const optionParameters: OptionParameters = { base, quote, expiry }

    const optionEntity: Option = new Option(
      optionParameters,
      await signer.getChainId(),
      optionAddress,
      18
    )
    const inputAmount: Quantity = new Quantity(new Asset(18), quantity)
    const trade: Trade = new Trade(
      optionEntity,
      inputAmount,
      Direction.LONG,
      Operation.LONG,
      signer
    )

    const tradeSettings: TradeSettings = {
      slippage: DEFAULT_SLIPPAGE,
      timeLimit: DEFAULT_TIMELIMIT,
      receiver: receiver,
      deadline: DEFAULT_DEADLINE,
      stablecoin: stablecoinAddress,
    }

    const transaction: SinglePositionParameters = Uniswap.singlePositionCallParameters(
      trade,
      tradeSettings
    )
    console.log(trade, transaction)

    const tx = await executeTransaction(signer, transaction)

    //const tx = await buy(signer, quantity, optionAddress, stablecoinAddress)
    if (tx.hash) {
      addTransaction(chainId, {
        hash: tx.hash,
        addedTime: now(),
        from: account,
      })
    }
  }

  const handleSellOptions = async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => {
    const stablecoinAddress = UniswapPairs[state.item.id].stablecoinAddress
    const signer = await provider.getSigner()

    const tx = await sell(signer, quantity, optionAddress, stablecoinAddress)
    if (tx.hash) {
      addTransaction(chainId, {
        hash: tx.hash,
        addedTime: now(),
        from: account,
      })
    }
  }

  const handleMintOptions = async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => {
    const signer = await provider.getSigner()

    const tx = await mint(signer, quantity, optionAddress)
    if (tx.hash) {
      addTransaction(chainId, {
        hash: tx.hash,
        addedTime: now(),
        from: account,
      })
    }
  }

  const handleExerciseOptions = async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => {
    const signer = await provider.getSigner()

    const tx = await exercise(signer, quantity, optionAddress)
    if (tx.hash) {
      addTransaction(chainId, {
        hash: tx.hash,
        addedTime: now(),
        from: account,
      })
    }
  }

  const handleRedeemOptions = async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => {
    const signer = await provider.getSigner()

    const tx = await redeem(signer, quantity, optionAddress)
    if (tx.hash) {
      addTransaction(chainId, {
        hash: tx.hash,
        addedTime: now(),
        from: account,
      })
    }
  }

  const handleCloseOptions = async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => {
    const signer = await provider.getSigner()

    const tx = await close(signer, quantity, optionAddress)
    if (tx.hash) {
      addTransaction(chainId, {
        hash: tx.hash,
        addedTime: now(),
        from: account,
      })
    }
  }

  const handleCreateOption = async (
    provider: Web3Provider,
    asset,
    isCallType,
    expiry,
    strike
  ) => {
    const signer = await provider.getSigner()

    const tx = await create(signer, asset, isCallType, expiry, strike)
    if (tx.hash) {
      addTransaction(chainId, {
        hash: tx.hash,
        addedTime: now(),
        from: account,
      })
    }
  }

  const handleMintTestTokens = async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => {
    const signer = await provider.getSigner()

    const tx = await mintTestToken(signer, optionAddress, quantity)
    if (tx.hash) {
      addTransaction(chainId, {
        hash: tx.hash,
        addedTime: now(),
        from: account,
      })
    }
  }

  return (
    <OrderContext.Provider
      value={{
        item: state.item,
        orderType: state.orderType,
        onAddItem: handleAddItem,
        onChangeItem: handleChangeItem,
        buyOptions: handleBuyOptions,
        sellOptions: handleSellOptions,
        mintOptions: handleMintOptions,
        exerciseOptions: handleExerciseOptions,
        redeemOptions: handleRedeemOptions,
        closeOptions: handleCloseOptions,
        createOption: handleCreateOption,
        mintTestTokens: handleMintTestTokens,
      }}
    >
      {props.children}
    </OrderContext.Provider>
  )
}

export default Order
