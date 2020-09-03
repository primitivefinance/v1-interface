import { createContext } from "react";

import { OptionsContextValues, EmptyAttributes } from "./types";

const OptionsContext = createContext<OptionsContextValues>({
    options: { calls: [EmptyAttributes], puts: [EmptyAttributes] },
    getOptions: (assetName: string) => {},
});

export default OptionsContext;
