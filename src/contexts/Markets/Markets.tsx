import React, { useCallback, useEffect, useState } from "react";

import Context from "./context";
import { Market } from "./types";

const NAME_FOR_POOL: { [key: string]: string } = {
    eth_market: "Weth",
    soon_market: "Soon...",
    future_market: "Soon...",
};

const ICON_FOR_POOL: { [key: string]: string } = {
    eth_market: "ETH",
    soon_market: "",
    future_market: "",
};

const SORT_FOR_POOL: { [key: string]: number } = {
    eth_market: 2,
    soon_market: 1,
    future_market: 0,
};

const Markets: React.FC = ({ children }) => {
    const [markets, setMarkets] = useState<Market[]>([]);

    const fetchMarkets = useCallback(async () => {
        const marketsArr: Market[] = [];
        const marketKeys = ["eth_market", "soon_market", "future_market"];

        for (let i = 0; i < marketKeys.length; i++) {
            const marketKey = marketKeys[i];
            let tokenKey = marketKey.replace("_market", "");
            if (tokenKey === "eth") {
                tokenKey = "weth";
            }

            try {
                marketsArr.push({
                    name: NAME_FOR_POOL[marketKey],
                    icon: ICON_FOR_POOL[marketKey],
                    id: tokenKey,
                    sort: SORT_FOR_POOL[marketKey],
                });
            } catch (e) {
                console.log(e);
            }
        }
        marketsArr.sort((a, b) => (a.sort < b.sort ? 1 : -1));
        setMarkets(marketsArr);
    }, [setMarkets]);

    useEffect(() => {
        fetchMarkets();
    }, [fetchMarkets]);

    return (
        <Context.Provider
            value={{
                markets,
            }}
        >
            {children}
        </Context.Provider>
    );
};

export default Markets;
