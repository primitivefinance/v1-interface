import { useContext } from "react";

import { OptionsContext } from "../contexts/Options";

const useOptions = () => {
    return useContext(OptionsContext);
};

export default useOptions;
