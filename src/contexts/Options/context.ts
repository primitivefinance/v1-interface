import { createContext } from "react";

import { OptionsContextValues, OptionsData, EmptyAttributes } from "./types";

const OptionsContext = createContext<OptionsContextValues>({
    options: { calls: [EmptyAttributes], puts: [EmptyAttributes] },
    getOptions: (assetAddres: string) => {},
});

export default OptionsContext;
