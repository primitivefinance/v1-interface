import { OrderItem, OrderState } from "./types";
import { EmptyAttributes } from "../Options/types";

const ADD_ITEM = "ADD_ITEM";
const REMOVE_ITEM = "REMOVE_ITEM";
const CHANGE_ITEM = "CHANGE_ITEM";

export interface AddItemAction {
    type: typeof ADD_ITEM;
    item: OrderItem;
}

export interface RemoveItemAction {
    type: typeof REMOVE_ITEM;
}

export interface ChangeItemAction {
    type: typeof CHANGE_ITEM;
    item: OrderItem;
}

export type OrderAction = AddItemAction | ChangeItemAction;

export const addItem = (item: OrderItem): AddItemAction => ({
    type: ADD_ITEM,
    item,
});

export const removeItem = (): RemoveItemAction => ({
    type: REMOVE_ITEM,
});

export const changeItem = (item: OrderItem): ChangeItemAction => ({
    type: CHANGE_ITEM,
    item,
});

export const initialState = {
    item: EmptyAttributes,
};

const reducer = (state: OrderState = initialState, action: OrderAction) => {
    switch (action.type) {
        case ADD_ITEM:
            return {
                item: action.item,
            };
        case CHANGE_ITEM:
            return {
                item: action.item,
            };
        default:
            return state;
    }
};

export default reducer;
