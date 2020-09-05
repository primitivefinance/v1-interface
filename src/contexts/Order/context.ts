import { createContext } from "react";

import { OrderContextValues, OrderItem, OrderType } from "./types";
import { EmptyAttributes } from "../Options/types";

const OrderContext = createContext<OrderContextValues>({
    item: EmptyAttributes,
    orderType: { buyOrMint: true },
    onAddItem: (item: OrderItem, orderType: OrderType) => {},
    onChangeItem: (item: OrderItem, orderType: OrderType) => {},
    buyOptions: async (
        provider: any,
        optionAddress: string,
        quantity: number | undefined
    ) => {},
    mintOptions: async (
        provider: any,
        optionAddress: string,
        quantity: number | undefined
    ) => {},
    exerciseOptions: async (
        provider: any,
        optionAddress: string,
        quantity: number | undefined
    ) => {},
    redeemOptions: async (
        provider: any,
        optionAddress: string,
        quantity: number | undefined
    ) => {},
    closeOptions: async (
        provider: any,
        optionAddress: string,
        quantity: number | undefined
    ) => {},
    loadPendingTx: () => {},
    createOption: async (
        provider: any,
        asset: string,
        isCallType: boolean,
        expiry: string,
        strike: number
    ) => {},
});

export default OrderContext;
