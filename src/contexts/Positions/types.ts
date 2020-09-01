export interface PositionsContextValues {
    positions: PositionsData;
    getPositions: (assetName: string) => void;
}
export interface PositionsData {
    calls: PositionsAttributes[];
    puts: PositionsAttributes[];
}

export type PositionsAttributes = {
    name: string;
    symbol: string;
    address: string;
    balance: number;
};

export const EmptyPositionsAttributes = {
    name: "",
    symbol: 0,
    address: "",
    balance: 0,
};

export interface PositionsState {
    positions: PositionsData;
}
