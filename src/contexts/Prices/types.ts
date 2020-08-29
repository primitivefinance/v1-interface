export interface PricesData {
    [key: string]: string;
}

export interface PricesState {
    prices: PricesData;
}

export interface PricesContext {
    prices: PricesData;
}
