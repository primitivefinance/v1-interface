export interface Market {
    name: string;
    icon: React.ReactNode;
    id: string;
    sort: number;
}

export interface MarketsContext {
    markets: Market[];
}
