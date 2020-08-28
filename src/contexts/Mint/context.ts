import { createContext } from "react";

import { MintContextValues, MintItem } from "./types";

const MintContext = createContext<MintContextValues>({
    items: [],
    onAddItem: (item: MintItem) => {},
    onRemoveItem: () => {},
});

export default MintContext;
