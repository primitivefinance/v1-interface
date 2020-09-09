import React, { useCallback, useReducer } from "react";
import Notify from "bnc-notify";

import OrderContext from "./context";

import reducer, { addItem, initialState, changeItem } from "./reducer";

import { OrderItem, OrderType } from "./types";

import { useWeb3React } from "@web3-react/core";

import UniswapPairs from "./uniswap_pairs.json";
import { buy, sell } from "../../lib/uniswap";
import { mint, exercise, redeem, close, create } from "../../lib/primitive";
import { mintTestToken } from "../../lib/utils";
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

    const handleBuyOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let stablecoinAddress = UniswapPairs[state.item.id].stablecoinAddress;
        let signer = await provider.getSigner();
        let tx = await buy(signer, quantity, optionAddress, stablecoinAddress);
        notifyInstance.hash(tx.hash);
    };

    const handleSellOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let stablecoinAddress = UniswapPairs[state.item.id].stablecoinAddress;
        let signer = await provider.getSigner();
        let tx = await sell(signer, quantity, optionAddress, stablecoinAddress);
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

    const handleCreateOption = async (
        provider,
        asset,
        isCallType,
        expiry,
        strike
    ) => {
        let signer = await provider.getSigner();
        let tx = await create(signer, asset, isCallType, expiry, strike);
        notifyInstance.hash(tx.hash);
    };

    const handleMintTestToken = async (provider, tokenAddress, quantity) => {
        let signer = await provider.getSigner();
        let tx = await mintTestToken(signer, tokenAddress, quantity);
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
                sellOptions: handleSellOptions,
                mintOptions: handleMintOptions,
                exerciseOptions: handleExerciseOptions,
                redeemOptions: handleRedeemOptions,
                closeOptions: handleCloseOptions,
                loadPendingTx: loadPendingTx,
                createOption: handleCreateOption,
            }}
        >
            {props.children}
        </OrderContext.Provider>
    );
};

export default Order;
