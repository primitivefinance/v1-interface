import { createContext } from "react";
import { MarketsContext } from "./types";

const context = createContext<MarketsContext>({
    markets: [],
});

export default context;
