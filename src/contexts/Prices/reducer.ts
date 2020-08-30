import { PricesData, PricesState } from "./types";

export const SET_PRICES = "SET_PRICES";

export interface SetPricesAction {
    type: typeof SET_PRICES;
    prices: PricesData;
}

export type PricesActions = SetPricesAction;
export const initialState: PricesState = {
    prices: {},
};

export const setPrices = (pricesData: PricesData): SetPricesAction => {
    return {
        type: SET_PRICES,
        prices: pricesData,
    };
};

const reducer = (state: PricesState, action: PricesActions) => {
    switch (action.type) {
        case SET_PRICES:
            return {
                ...state,
                prices: {
                    ...state.prices,
                    ...action.prices,
                },
            };
        default:
            return state;
    }
};

export default reducer;
