import { MintItem, MintState } from "./types";

const ADD_ITEM = "ADD_ITEM";
const REMOVE_ITEM = "REMOVE_ITEM";

export interface AddItemAction {
    type: typeof ADD_ITEM;
    item: MintItem;
}

export interface RemoveItemAction {
    type: typeof REMOVE_ITEM;
}

export type MintAction = AddItemAction | RemoveItemAction;

export const addItem = (item: MintItem): AddItemAction => ({
    type: ADD_ITEM,
    item,
});

export const removeItem = (): RemoveItemAction => ({
    type: REMOVE_ITEM,
});

export const initialState = {
    items: [],
};

const reducer = (state: MintState = initialState, action: MintAction) => {
    switch (action.type) {
        case ADD_ITEM:
            return {
                ...state,
                items: [...state.items, action.item],
            };
        case REMOVE_ITEM:
            return state;
        default:
            return state;
    }
};

export default reducer;
