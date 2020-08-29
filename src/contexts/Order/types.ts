export interface OrderContextValues {
    items: OrderItem[];
    onAddItem: (item: OrderItem) => void;
    onRemoveItem: () => void;
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
    items: OrderItem[];
}
