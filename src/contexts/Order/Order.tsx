import React, { useCallback, useReducer } from "react";

import OrderContext from "./context";

import reducer, { addItem, initialState, changeItem } from "./reducer";

import { OrderItem, OrderType } from "./types";

import UniswapPairs from "./uniswap_pairs.json";
import { swap } from "../../lib/uniswap";
import { mint, exercise, redeem, close } from "../../lib/primitive";

const Order: React.FC = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);

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

    const handleRemoveItem = useCallback(
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
        await swap(signer, quantity, optionAddress, stablecoinAddress);
    };

    const handleMintOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let signer = await provider.getSigner();
        await mint(signer, quantity, optionAddress);
    };

    const handleExerciseOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let signer = await provider.getSigner();
        await exercise(signer, quantity, optionAddress);
    };

    const handleRedeemOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let signer = await provider.getSigner();
        await redeem(signer, quantity, optionAddress);
    };

    const handleCloseOptions = async (
        provider,
        optionAddress: string,
        quantity: any
    ) => {
        let signer = await provider.getSigner();
        await close(signer, quantity, optionAddress);
    };

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
            }}
        >
            {props.children}
        </OrderContext.Provider>
    );
};

export default Order;
