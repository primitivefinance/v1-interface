import { createContext } from "react";

import {
    PositionsContextValues,
    PositionsData,
    EmptyPositionsAttributes,
} from "./types";

const PositionsContext = createContext<PositionsContextValues>({
    positions: {
        calls: [EmptyPositionsAttributes],
        puts: [EmptyPositionsAttributes],
    },
    getPositions: (assetName: string) => {},
});

export default PositionsContext;
