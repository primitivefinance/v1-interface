import React, { useCallback, useReducer } from "react";

import OrderContext from "./context";

import reducer, { addItem, initialState, changeItem } from "./reducer";

import { OrderItem, OrderType } from "./types";

import UniswapPairs from "./uniswap_pairs.json";
import { swap } from "../../lib/uniswap";
import { mint } from "../../lib/primitive";

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

    return (
        <OrderContext.Provider
            value={{
                item: state.item,
                orderType: state.orderType,
                onAddItem: handleAddItem,
                onChangeItem: handleChangeItem,
                buyOptions: handleBuyOptions,
                mintOptions: handleMintOptions,
            }}
        >
            {props.children}
        </OrderContext.Provider>
    );
};

export default Order;
