import {
    PositionsData,
    PositionsState,
    EmptyPositionsAttributes,
} from "./types";

export const SET_OPTIONS = "SET_OPTIONS";

export interface SetPositionsAction {
    type: typeof SET_OPTIONS;
    positions: PositionsData;
}

export type PositionsActions = SetPositionsAction;
export const initialState: PositionsState = {
    positions: {
        calls: [EmptyPositionsAttributes],
        puts: [EmptyPositionsAttributes],
    },
};

export const setPositions = (
    positionsData: PositionsData
): SetPositionsAction => {
    return {
        type: SET_OPTIONS,
        positions: positionsData,
    };
};

const reducer = (state: PositionsState, action: PositionsActions) => {
    switch (action.type) {
        case SET_OPTIONS:
            return {
                ...state,
                positions: {
                    ...state.positions,
                    ...action.positions,
                },
            };
        default:
            return state;
    }
};

export default reducer;
