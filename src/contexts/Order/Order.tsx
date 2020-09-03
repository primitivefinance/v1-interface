import React, { useCallback, useReducer } from "react";
import Notify from "bnc-notify";

import OrderContext from "./context";

import reducer, { addItem, initialState, changeItem } from "./reducer";

import { OrderItem, OrderType } from "./types";

import { useWeb3React } from "@web3-react/core";

import UniswapPairs from "./uniswap_pairs.json";
import { swap } from "../../lib/uniswap";
import { mint, exercise, redeem, close } from "../../lib/primitive";
require("dotenv").config();

const NotifyKey = process.env.REACT_APP_NOTIFY_KEY;

const Order: React.FC = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const web3React = useWeb3React();
    const provider = web3React.library;

    let notifyInstance;
    if (NotifyKey) {
        notifyInstance = Notify({
            dappId: NotifyKey,
            networkId: 4,
        });
    }

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

    /* const handleRemoveItem = useCallback(
        (item: OrderItem, orderType: OrderType) => {
            dispatch(changeItem(item, orderType));
        },
        [dispatch]
    ); */

    const handleBuyOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let stablecoinAddress = UniswapPairs[state.item.id].stablecoinAddress;
        let signer = await provider.getSigner();
        let tx = await swap(signer, quantity, optionAddress, stablecoinAddress);
        notifyInstance.hash(tx.hash);
    };

    const handleMintOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let signer = await provider.getSigner();
        let tx = await mint(signer, quantity, optionAddress);
        notifyInstance.hash(tx.hash);
        localStorage.setItem("pendingTx", tx.hash);
    };

    const handleExerciseOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let signer = await provider.getSigner();
        let tx = await exercise(signer, quantity, optionAddress);
        notifyInstance.hash(tx.hash);
    };

    const handleRedeemOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let signer = await provider.getSigner();
        let tx = await redeem(signer, quantity, optionAddress);
        notifyInstance.hash(tx.hash);
    };

    const handleCloseOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let signer = await provider.getSigner();
        let tx = await close(signer, quantity, optionAddress);
        notifyInstance.hash(tx.hash);
    };

    const loadPendingTx = useCallback(async () => {
        const pendingTx = localStorage.getItem("pendingTx");
        if (pendingTx && provider) {
            let receipt = await provider.getTransactionReceipt(pendingTx);
            if (receipt && receipt.confirmations) {
                return;
            } else {
                notifyInstance.hash(pendingTx);
            }
        }
    }, [provider, notifyInstance]);

    return (
        <OrderContext.Provider
            value={{
                item: state.item,
                orderType: state.orderType,
                onAddItem: handleAddItem,
                onChangeItem: handleChangeItem,
                buyOptions: handleBuyOptions,
                mintOptions: handleMintOptions,
                exerciseOptions: handleExerciseOptions,
                redeemOptions: handleRedeemOptions,
                closeOptions: handleCloseOptions,
                loadPendingTx: loadPendingTx,
            }}
        >
            {props.children}
        </OrderContext.Provider>
    );
};

export default Order;
