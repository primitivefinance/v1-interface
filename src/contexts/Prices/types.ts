export interface PricesContextValues {
    prices: PricesData;
    getPrices: () => void;
}
export interface PricesData {
    [key: string]: string;
}

export interface PricesState {
    prices: PricesData;
}
