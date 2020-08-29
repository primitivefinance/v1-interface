import { createContext } from "react";

import { PricesContext } from "./types";

const context = createContext<PricesContext>({
    prices: {},
});

export default context;
