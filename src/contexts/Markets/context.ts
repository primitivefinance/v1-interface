import { createContext } from "react";
import { MarketsContext } from "./types";

const context = createContext<MarketsContext>({
    markets: [],
    unharvested: 0,
});

export default context;
