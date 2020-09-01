export interface OrderContextValues {
    item: OrderItem;
    orderType: OrderType;
    onAddItem: (item: OrderItem, orderType: OrderType) => void;
    onChangeItem: (item: OrderItem, orderType: OrderType) => void;
    buyOptions: (
        provider: any,
        optionAddress: string,
        quantity: number | undefined
    ) => Promise<void>;
    mintOptions: (
        provider: any,
        optionAddress: string,
        quantity: number | undefined
    ) => Promise<void>;
}

export interface OrderItem {
    breakEven: number;
    change: number;
    price: number;
    strike: number;
    volume: number;
    address: string;
    id: string;
    expiry: number;
}

export interface OrderState {
    item: OrderItem;
    orderType: OrderType;
}

export interface OrderType {
    buyOrMint: boolean;
}
