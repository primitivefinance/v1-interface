import { createContext } from "react";

import { PricesContextValues } from "./types";

const PricesContext = createContext<PricesContextValues>({
    prices: {},
    getPrices: () => {},
});

export default PricesContext;
