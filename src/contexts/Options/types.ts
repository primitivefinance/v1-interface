export interface OptionsContextValues {
    options: OptionsData;
    getOptions: (assetName: string) => void;
}
export interface OptionsData {
    calls: OptionsAttributes[];
    puts: OptionsAttributes[];
}

export type OptionsAttributes = {
    breakEven: number;
    change: number;
    price: number;
    strike: number;
    volume: number;
    address: string;
    id: string;
};

export const EmptyAttributes = {
    breakEven: 0,
    change: 0,
    price: 0,
    strike: 0,
    volume: 0,
    address: "",
    id: "",
};

export interface OptionsState {
    options: OptionsData;
}
