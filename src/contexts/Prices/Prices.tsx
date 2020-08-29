import React, { useCallback, useReducer, useEffect } from "react";

import PricesContext from "./context";
import pricesReducer, { initialState, setPrices } from "./reducer";
import { PricesData } from "./types";

const ethPriceApi =
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true";

const Prices: React.FC = (props) => {
    const [state, dispatch] = useReducer(pricesReducer, initialState);

    const getPrices = useCallback(() => {
        let pricesData: PricesData = {};
        fetch(ethPriceApi)
            .then((res) => res.json())
            .then(
                (result) => {
                    console.log(result);
                    Object.assign(pricesData, {
                        result,
                    });
                    dispatch(setPrices(pricesData));
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    Object.assign(pricesData, {
                        error,
                    });
                    console.log(error);
                }
            );
    }, [dispatch]);

    useEffect(() => {
        getPrices();
    }, [getPrices]);

    return (
        <PricesContext.Provider
            value={{
                prices: state.prices,
            }}
        >
            {props.children}
        </PricesContext.Provider>
    );
};

export default Prices;
