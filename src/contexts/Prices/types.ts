export interface PricesContextValues {
    prices: PricesData;
    getPrices: (asset: string) => void;
}
export interface PricesData {
    [key: string]: number;
}

export interface PricesState {
    prices: PricesData;
}
