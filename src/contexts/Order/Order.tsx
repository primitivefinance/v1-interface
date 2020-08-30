import React, { useCallback, useReducer } from "react";

import OrderContext from "./context";

import reducer, { addItem, initialState, changeItem } from "./reducer";

import { OrderItem } from "./types";

import UniswapPairs from "./uniswap_pairs.json";
import { swap } from "../../lib/uniswap";

const Order: React.FC = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleAddItem = useCallback(
        (item: OrderItem) => {
            dispatch(addItem(item));
        },
        [dispatch]
    );

    const handleChangeItem = useCallback(
        (item: OrderItem) => {
            dispatch(changeItem(item));
        },
        [dispatch]
    );

    const handleBuyOptions = async (provider, optionAddress, quantity: any) => {
        let stablecoinAddress = UniswapPairs[state.item.id].stablecoinAddress;
        let signer = await provider.getSigner();
        await swap(signer, quantity, optionAddress, stablecoinAddress);
    };

    return (
        <OrderContext.Provider
            value={{
                item: state.item,
                onAddItem: handleAddItem,
                onChangeItem: handleChangeItem,
                buyOptions: handleBuyOptions,
            }}
        >
            {props.children}
        </OrderContext.Provider>
    );
};

export default Order;
