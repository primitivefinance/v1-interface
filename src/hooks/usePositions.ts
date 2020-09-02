import { useContext } from "react";

import { PositionsContext } from "../contexts/Positions";

const usePositions = () => {
    return useContext(PositionsContext);
};

export default usePositions;
