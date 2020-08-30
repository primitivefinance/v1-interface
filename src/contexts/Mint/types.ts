export interface MintContextValues {
    items: MintItem[];
    onAddItem: (item: MintItem) => void;
    onRemoveItem: () => void;
}

export interface MintItem {}

export interface MintState {
    items: MintItem[];
}
