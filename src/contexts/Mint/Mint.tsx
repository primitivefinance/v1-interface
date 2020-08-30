import React, { useCallback, useReducer } from "react";

import MintContext from "./context";

import reducer, { addItem, initialState, removeItem } from "./reducer";

import { MintItem } from "./types";

const Mint: React.FC = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleAddItem = useCallback(
        (item: MintItem) => {
            dispatch(addItem(item));
        },
        [dispatch]
    );

    const handleRemoveItem = useCallback(() => {
        dispatch(removeItem());
    }, [dispatch]);

    return (
        <MintContext.Provider
            value={{
                items: state.items,
                onAddItem: handleAddItem,
                onRemoveItem: handleRemoveItem,
            }}
        >
            {props.children}
        </MintContext.Provider>
    );
};

export default Mint;
