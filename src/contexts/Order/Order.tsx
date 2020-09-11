import React, { useCallback, useReducer } from "react";
import Notify from "bnc-notify";

import OrderContext from "./context";

import reducer, { addItem, initialState, changeItem } from "./reducer";

import { OrderItem, OrderType } from "./types";

import { useWeb3React } from "@web3-react/core";

import UniswapPairs from "./uniswap_pairs.json";
import { buy, sell } from "../../lib/uniswap";
import {
    mint,
    exercise,
    redeem,
    close,
    create,
    mintTestToken,
} from "../../lib/primitive";
require("dotenv").config();

const NotifyKey = process.env.REACT_APP_NOTIFY_KEY;

const Order: React.FC = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { library, chainId } = useWeb3React();

    let notifyInstance;
    if (NotifyKey) {
        notifyInstance = Notify({
            dappId: NotifyKey,
            networkId: 4,
        });
    }

    const networkIdToUrl = {
        "1": "https://etherscan.io/tx",
        "4": "https://rinkeby.etherscan.io/tx",
    };

    const addEtherscan = (transaction) => {
        return {
            onclick: () =>
                window.open(
                    `${networkIdToUrl[chainId || 1]}/${transaction.hash}`
                ),
        };
    };

    const handleAddItem = useCallback(
        (item: OrderItem, orderType: OrderType) => {
            dispatch(addItem(item, orderType));
        },
        [dispatch]
    );

    const handleChangeItem = useCallback(
        (item: OrderItem, orderType: OrderType) => {
            dispatch(changeItem(item, orderType));
        },
        [dispatch]
    );

    const handleBuyOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let stablecoinAddress = UniswapPairs[state.item.id].stablecoinAddress;
        let signer = await provider.getSigner();
        let tx = await buy(signer, quantity, optionAddress, stablecoinAddress);
        const { emitter } = notifyInstance.hash(tx.hash);
        emitter.on("all", addEtherscan);
    };

    const handleSellOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let stablecoinAddress = UniswapPairs[state.item.id].stablecoinAddress;
        let signer = await provider.getSigner();
        let tx = await sell(signer, quantity, optionAddress, stablecoinAddress);
        const { emitter } = notifyInstance.hash(tx.hash);
        emitter.on("all", addEtherscan);
    };

    const handleMintOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let signer = await provider.getSigner();
        let tx = await mint(signer, quantity, optionAddress);
        const { emitter } = notifyInstance.hash(tx.hash);
        emitter.on("all", addEtherscan);
        localStorage.setItem("pendingTx", tx.hash);
    };

    const handleExerciseOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let signer = await provider.getSigner();
        let tx = await exercise(signer, quantity, optionAddress);
        const { emitter } = notifyInstance.hash(tx.hash);
        emitter.on("all", addEtherscan);
    };

    const handleRedeemOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let signer = await provider.getSigner();
        let tx = await redeem(signer, quantity, optionAddress);
        const { emitter } = notifyInstance.hash(tx.hash);
        emitter.on("all", addEtherscan);
    };

    const handleCloseOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let signer = await provider.getSigner();
        let tx = await close(signer, quantity, optionAddress);
        const { emitter } = notifyInstance.hash(tx.hash);
        emitter.on("all", addEtherscan);
    };

    const handleCreateOption = async (
        provider,
        asset,
        isCallType,
        expiry,
        strike
    ) => {
        let signer = await provider.getSigner();
        let tx = await create(signer, asset, isCallType, expiry, strike);
        const { emitter } = notifyInstance.hash(tx.hash);
        emitter.on("all", addEtherscan);
    };

    const handleMintTestTokens = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let signer = await provider.getSigner();
        let tx = await mintTestToken(signer, optionAddress, quantity);
        const { emitter } = notifyInstance.hash(tx.hash);
        emitter.on("all", addEtherscan);
    };

    const loadPendingTx = useCallback(async () => {
        const pendingTx = localStorage.getItem("pendingTx");
        if (pendingTx && library) {
            let receipt = await library.getTransactionReceipt(pendingTx);
            if (receipt && receipt.confirmations) {
                return;
            } else {
                notifyInstance.hash(pendingTx);
            }
        }
    }, [library, notifyInstance]);

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
                loadPendingTx: loadPendingTx,
                createOption: handleCreateOption,
                mintTestTokens: handleMintTestTokens,
            }}
        >
            {props.children}
        </OrderContext.Provider>
    );
};

export default Order;
