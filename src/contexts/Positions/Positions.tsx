import React, { useCallback, useReducer, useEffect } from "react";
import { parseEther } from "ethers/lib/utils";
import {
    Token,
    Fetcher,
    Trade,
    TokenAmount,
    TradeType,
    Route,
} from "@uniswap/sdk";

import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

import Option from "@primitivefi/contracts/artifacts/Option.json";

import useOptions from "../../hooks/useOptions";

import PositionsContext from "./context";
import positionsReducer, { initialState, setPositions } from "./reducer";
import {
    PositionsData,
    EmptyPositionsAttributes,
    PositionsAttributes,
} from "./types";
import { ethers } from "ethers";

const Positions: React.FC = (props) => {
    const [state, dispatch] = useReducer(positionsReducer, initialState);
    const { options, getOptions } = useOptions();

    const handlePositions = useCallback(async () => {
        // Web3 variables
        const provider = web3React.library;
        const signer = await provider.getSigner();
        const chain = await signer.getChainId();

        let positionsObject = {
            calls: [EmptyPositionsAttributes],
            puts: [EmptyPositionsAttributes],
        };

        let calls: PositionsAttributes[] = [];
        let puts: PositionsAttributes[] = [];
        let optionCallsLength: number = options.calls.length;
        let optionPutsLength: number = options.puts.length;

        for (let i = 0; i < optionCallsLength; i++) {
            // for each call, populate the positions object.
            let name;
            let symbol;
            let address;
            let balance;

            name = options.calls[i].id;
            address = options.calls[id].address;

            let option = new ethers.Contract(address, Option.abi, signer);
            symbol = await option.symbol();
        }
    }, [dispatch]);

    return (
        <PositionsContext.Provider
            value={{
                positions: state.positions,
                getPositions: handlePositions,
            }}
        >
            {props.children}
        </PositionsContext.Provider>
    );
};

export default Positions;
