export interface OrderContextValues {
    item: OrderItem;
    onAddItem: (item: OrderItem) => void;
    onChangeItem: (item: OrderItem) => void;
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
}

export interface OrderState {
    item: OrderItem;
}
