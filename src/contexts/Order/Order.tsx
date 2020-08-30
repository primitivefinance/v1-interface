import React, { useCallback, useReducer } from "react";

import OrderContext from "./context";

import reducer, {
    addItem,
    initialState,
    removeItem,
    changeItem,
} from "./reducer";

import { OrderItem } from "./types";

const Order: React.FC = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleAddItem = useCallback(
        (item: OrderItem) => {
            dispatch(addItem(item));
        },
        [dispatch]
    );

    const handleRemoveItem = useCallback(
        (item: OrderItem) => {
            dispatch(changeItem(item));
        },
        [dispatch]
    );

    const handleChangeItem = useCallback(
        (item: OrderItem) => {
            dispatch(changeItem(item));
        },
        [dispatch]
    );

    const handleBuyOptions = async (optionAddress, quantity: any) => {
        console.log("Buying options:", { optionAddress, quantity });
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
