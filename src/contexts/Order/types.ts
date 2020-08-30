export interface OrderContextValues {
    item: OrderItem;
    onAddItem: (item: OrderItem) => void;
    onChangeItem: (item: OrderItem) => void;
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
