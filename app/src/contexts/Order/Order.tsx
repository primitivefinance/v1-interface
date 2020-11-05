import React, { useCallback, useReducer } from 'react'
import ethers, { BigNumberish } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { Transaction } from '@/contexts/Transactions/types'
import OrderContext from './context'
import { OrderItem } from './types'
import reducer, {
  addItem,
  initialState,
  changeItem,
  removeItem,
} from './reducer'

import {
  DEFAULT_DEADLINE,
  DEFAULT_TIMELIMIT,
  STABLECOINS,
} from '@/constants/index'

import { Operation, UNISWAP_FACTORY_V2 } from '@/lib/constants'
import { Option, createOptionEntityWithAddress } from '@/lib/entities/option'
import { parseEther } from 'ethers/lib/utils'
import { Asset, Trade, Quantity } from '@/lib/entities'
import { Trader } from '@/lib/trader'
import { Uniswap } from '@/lib/uniswap'
import { TradeSettings, SinglePositionParameters } from '@/lib/types'
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json'

import executeTransaction from '@/lib/utils/executeTransaction'
import useTransactions from '@/hooks/transactions/index'
import { useSlippage } from '@/hooks/user'

const Order: React.FC = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { chainId, account } = useWeb3React()
  const { addTransaction } = useTransactions()
  const [slippage] = useSlippage()
  const now = () => new Date().getTime()

  const handleAddItem = useCallback(
    (item: OrderItem, orderType: string) => {
      dispatch(addItem(item, orderType))
    },
    [dispatch]
  )

  const handleChangeItem = useCallback(
    (item: OrderItem, orderType: string) => {
      dispatch(changeItem(item, orderType))
    },
    [dispatch]
  )

  const handleRemoveItem = useCallback(
    (item: OrderItem) => {
      dispatch(removeItem(item))
    },
    [dispatch]
  )

  const handleSubmitOrder = async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number,
    operation: Operation
  ) => {
    const signer: ethers.Signer = await provider.getSigner()
    const receiver: string = await signer.getAddress()
    const tradeSettings: TradeSettings = {
      slippage: slippage,
      timeLimit: DEFAULT_TIMELIMIT,
      receiver: receiver,
      deadline: DEFAULT_DEADLINE,
      stablecoin: STABLECOINS[chainId].address,
    }

    const optionEntity: Option = createOptionEntityWithAddress(
      chainId,
      optionAddress
    )
    const inputAmount: Quantity = new Quantity(
      new Asset(18), // fix with actual metadata
      parseEther(quantity.toString())
    )
    const outputAmount: Quantity = new Quantity(
      new Asset(18), // fix with actual metadata
      '0'
    )
    const optionInstance: ethers.Contract = optionEntity.optionInstance(signer)
    const base: ethers.BigNumber = await optionInstance.getBaseValue()
    const quote: ethers.BigNumber = await optionInstance.getQuoteValue()
    const assetAddresses: string[] = await optionInstance.getAssetAddresses()
    optionEntity.setAssetAddresses(assetAddresses)
    optionEntity.optionParameters.base = new Quantity(new Asset(18), base)
    optionEntity.optionParameters.quote = new Quantity(new Asset(18), quote)

    const path: string[] = []
    const amountsIn: BigNumberish[] = []
    let amountsOut: BigNumberish[] = []
    const reserves: BigNumberish[] = []
    let totalSupply: BigNumberish
    const trade: Trade = new Trade(
      optionEntity,
      inputAmount,
      outputAmount,
      path,
      reserves,
      totalSupply,
      amountsIn,
      amountsOut,
      operation,
      signer
    )

    const factory = new ethers.Contract(
      UNISWAP_FACTORY_V2,
      UniswapV2Factory.abi,
      signer
    )
    // type SinglePositionParameters fails due to difference in Trader and Uniswap type
    let transaction: any
    switch (operation) {
      case Operation.LONG:
        // For this operation, the user borrows underlyingTokens to use to mint redeemTokens, which are then returned to the pair.
        // This is effectively a swap from redeemTokens to underlyingTokens, but it occurs in the reverse order.
        trade.path = [
          assetAddresses[2], // redeem
          assetAddresses[0], // underlying
        ]
        // The amountsOut[1] will tell us how much of the flash loan of underlyingTokens is outstanding.
        trade.amountsOut = await trade.getAmountsOut(
          signer,
          factory,
          inputAmount.quantity,
          trade.path
        )
        // With the Pair's reserves, we can calculate all values using pure functions, including the premium.
        trade.reserves = await trade.getReserves(
          signer,
          factory,
          trade.path[0],
          trade.path[1]
        )
        transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
        break
      case Operation.SHORT:
        // Going SHORT on an option effectively means holding the SHORT OPTION TOKENS.
        // Purchase them for underlyingTokens from the underlying<>redeem UniswapV2Pair.
        trade.path = [
          assetAddresses[0], // underlying
          assetAddresses[2], // redeem
        ]
        amountsOut = await trade.getAmountsOut(
          signer,
          factory,
          trade.inputAmount.quantity,
          trade.path
        )
        trade.outputAmount.quantity = amountsOut[1]
        transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
        break
      case Operation.CLOSE_LONG:
        // On the UI, the user inputs the quantity of LONG OPTIONS they want to close.
        // Calling the function on the contract requires the quantity of SHORT OPTIONS being borrowed to close.
        // Need to calculate how many SHORT OPTIONS are needed to close the desired quantity of LONG OPTIONS.
        const redeemAmount = ethers.BigNumber.from(inputAmount.quantity)
          .mul(quote)
          .div(base)
        // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
        // with the path of underlyingTokens to redeemTokens.
        trade.path = [
          assetAddresses[0], // underlying
          assetAddresses[2], // redeem
        ]
        // The amountIn[0] will tell how many underlyingTokens are needed for the borrowed amount of redeemTokens.
        trade.amountsIn = await trade.getAmountsIn(
          signer,
          factory,
          redeemAmount,
          trade.path
        )
        // Get the reserves here because we have the web3 context. With the reserves, we can calulcate all token outputs.
        trade.reserves = await trade.getReserves(
          signer,
          factory,
          trade.path[0],
          trade.path[1]
        )
        // The actual function will take the redeemQuantity rather than the optionQuantity.
        trade.inputAmount.quantity = redeemAmount
        transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
        break
      case Operation.CLOSE_SHORT:
        // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
        // with the path of underlyingTokens to redeemTokens.
        trade.path = [
          assetAddresses[2], // redeem
          assetAddresses[0], // underlying
        ]
        // The amountIn[0] will tell how many underlyingTokens are needed for the borrowed amount of redeemTokens.
        trade.amountsOut = await trade.getAmountsOut(
          signer,
          factory,
          trade.inputAmount.quantity,
          trade.path
        )
        // The actual function will take the redeemQuantity rather than the optionQuantity.
        trade.outputAmount.quantity = trade.amountsOut[1]
        transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
        break
      case Operation.ADD_LIQUIDITY:
        // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
        // with the path of underlyingTokens to redeemTokens.
        trade.path = [
          assetAddresses[2], // redeem
          assetAddresses[0], // underlying
        ]
        // The amountIn[0] will tell how many underlyingTokens are needed for the borrowed amount of redeemTokens.
        trade.amountsOut = await trade.getAmountsOut(
          signer,
          factory,
          trade.inputAmount.quantity,
          trade.path
        )
        // Get the reserves here because we have the web3 context. With the reserves, we can calulcate all token outputs.
        trade.reserves = await trade.getReserves(
          signer,
          factory,
          trade.path[0],
          trade.path[1]
        )

        // The actual function will take the redeemQuantity rather than the optionQuantity.
        trade.outputAmount.quantity = trade.amountsOut[1]
        transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
        break
      case Operation.REMOVE_LIQUIDITY:
        // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
        // with the path of underlyingTokens to redeemTokens.
        trade.path = [
          assetAddresses[2], // redeem
          assetAddresses[0], // underlying
        ]
        // Get the reserves here because we have the web3 context. With the reserves, we can calulcate all token outputs.
        trade.reserves = await trade.getReserves(
          signer,
          factory,
          trade.path[0],
          trade.path[1]
        )
        trade.totalSupply = await trade.getTotalSupply(
          signer,
          factory,
          trade.path[0],
          trade.path[1]
        )
        transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
        transaction.tokensToApprove = [
          await factory.getPair(trade.path[0], trade.path[1]),
        ] // need to approve LP token
        break
      case Operation.REMOVE_LIQUIDITY_CLOSE:
        // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
        // with the path of underlyingTokens to redeemTokens.
        trade.path = [
          assetAddresses[2], // redeem
          assetAddresses[0], // underlying
        ]
        // Get the reserves here because we have the web3 context. With the reserves, we can calulcate all token outputs.
        trade.reserves = await trade.getReserves(
          signer,
          factory,
          trade.path[0],
          trade.path[1]
        )
        trade.totalSupply = await trade.getTotalSupply(
          signer,
          factory,
          trade.path[0],
          trade.path[1]
        )
        transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
        transaction.tokensToApprove = [
          await factory.getPair(trade.path[0], trade.path[1]),
        ] // need to approve LP token
        break
      default:
        transaction = Trader.singleOperationCallParameters(trade, tradeSettings)
        break
    }

    const tx: Transaction = await executeTransaction(signer, transaction)
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
        onRemoveItem: handleRemoveItem,
        submitOrder: handleSubmitOrder,
      }}
    >
      {props.children}
    </OrderContext.Provider>
  )
}

export default Order
