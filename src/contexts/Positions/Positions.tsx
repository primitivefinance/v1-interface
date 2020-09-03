import React, { useCallback, useReducer, useEffect } from "react";
import { parseEther, formatEther } from "ethers/lib/utils";
import {
    Token,
    Fetcher,
    Trade,
    TokenAmount,
    TradeType,
    Route,
} from "@uniswap/sdk";

import { useWeb3React } from "@web3-react/core";

import ERC20 from "@primitivefi/contracts/artifacts/TestERC20.json";

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

    // Web3 injection
    const { library } = useWeb3React();
    const provider = library;

    const handlePositions = useCallback(
        async (assetName: string, options) => {
            // Web3 variables
            const signer = await provider.getSigner();
            const account = await signer.getAddress();

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
                address = options.calls[i].address;
                let option = new ethers.Contract(address, ERC20.abi, signer);
                symbol = await option.symbol();
                balance = Number(formatEther(await option.balanceOf(account)));

                calls.push({
                    name: name,
                    symbol: symbol,
                    address: address,
                    balance: balance,
                });
            }

            for (let i = 0; i < optionPutsLength; i++) {
                // for each call, populate the positions object.
                let name;
                let symbol;
                let address;
                let balance;

                name = options.puts[i].id;
                address = options.puts[i].address;

                let option = new ethers.Contract(address, ERC20.abi, signer);
                symbol = await option.symbol();
                balance = Number(formatEther(await option.balanceOf(account)));

                puts.push({
                    name: name,
                    symbol: symbol,
                    address: address,
                    balance: balance,
                });
            }

            Object.assign(positionsObject, {
                calls: calls,
                puts: puts,
            });

            dispatch(setPositions(positionsObject));
        },
        [dispatch, provider]
    );

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
