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

import OptionsContext from "./context";
import optionsReducer, { initialState, setOptions } from "./reducer";
import { OptionsData, EmptyAttributes, OptionsAttributes } from "./types";

import OptionDeployments from "./options_deployments.json";
import AssetAddresses from "./assets.json";
import { parse } from "path";

const Options: React.FC = (props) => {
    const [state, dispatch] = useReducer(optionsReducer, initialState);

    // Web3 injection
    const web3React = useWeb3React();
    const injected = new InjectedConnector({
        supportedChainIds: [1, 3, 4, 5, 42],
    });
    const provider = web3React.library;

    // Connect to web3 automatically using injected
    useEffect(() => {
        (async () => {
            try {
                await web3React.activate(injected);
            } catch (err) {
                console.log(err);
            }
        })();
    }, []);

    /**
     * @dev Calculates the breakeven asset price depending on if the option is a call or put.
     * @param strike The strike price of the option.
     * @param price The current price of the option.
     * @param isCall If the option is a call, if not a call, its a put.
     */
    const calculateBreakeven = (strike, price, isCall) => {
        let breakeven;
        if (isCall) {
            breakeven = price + strike;
        } else {
            breakeven = price + strike;
        }
        return Number(breakeven);
    };

    /**
     * @dev If no provider is connected, it will stop execution by returning.
     * @param args Any args...
     */
    const checkProvider = (...args) => {
        if (!provider) {
            console.error("No connected provider");
            return { ...args };
        }
    };

    /**
     * @dev Gets the execution price for 1 unit of option tokens and returns it.
     * @param optionAddress The address of the option token to get a uniswap pair of.
     */
    const getPairData = async (optionAddress) => {
        let premium = 0;

        // Check to make sure we are connected to a web3 provider.
        checkProvider();
        const signer = await provider.getSigner();
        const chain = await signer.getChainId();
        const stablecoinAddress = "0xb05cB19b19e09c4c7b72EA929C8CfA3187900Ad2";

        const OPTION = new Token(chain, optionAddress, 18);
        const STABLECOIN = new Token(chain, stablecoinAddress, 18);

        const pair = await Fetcher.fetchPairData(STABLECOIN, OPTION);
        const route = new Route([pair], STABLECOIN, OPTION);
        const midPrice = Number(route.midPrice.toSignificant(6));

        const unit = parseEther("1").toString();
        const tokenAmount = new TokenAmount(OPTION, unit);
        const trade = new Trade(route, tokenAmount, TradeType.EXACT_OUTPUT);

        const executionPrice = Number(trade.executionPrice.toSignificant(6));

        premium = executionPrice > midPrice ? executionPrice : midPrice;
        return { premium };
    };

    /**
     * @dev Gets the address of an asset using its name and respective network id.
     * @param assetName The name of the asset.
     * @param chainId The chain of the network to get the asset on.
     */
    const getAssetAddress = (assetName, chainId) => {
        let address = AssetAddresses[assetName][chainId];
        return address;
    };

    const handleOptions = useCallback(
        async (assetName) => {
            // Web3 variables
            const provider = web3React.library;
            const signer = await provider.getSigner();
            const chain = await signer.getChainId();

            // Asset address and quantity of options
            let assetAddress = getAssetAddress(assetName, chain);
            let optionsLength = Object.keys(OptionDeployments).length;

            // Objects and arrays to populate
            let optionsObject = {
                calls: [EmptyAttributes],
                puts: [EmptyAttributes],
            };
            let calls: OptionsAttributes[] = [];
            let puts: OptionsAttributes[] = [];

            // For each option in the option deployments file...
            for (let i = 0; i < optionsLength; i++) {
                // Get the parameters for the option object in the option_deployments json file.
                let key = Object.keys(OptionDeployments)[i];
                let id = key;
                let parameters = OptionDeployments[key].optionParameters;
                let address = OptionDeployments[key].address;
                let underlyingToken = parameters[0];
                let strikeToken = parameters[1];
                let base = parameters[2];
                let quote = parameters[3];

                // If the selected asset is not one of the assets in the option, skip it.
                if (
                    assetAddress != underlyingToken &&
                    assetAddress != strikeToken
                ) {
                    return;
                }

                // Initialize the values we need to grab.
                let breakEven = 0;
                let change = 0;
                let price = 0;
                let strike = 0;
                let volume = 0;
                let isCall;

                // Get the option price data from uniswap pair.
                const { premium } = await getPairData(address);
                price = premium;

                // If the base is 1, push to calls array. If quote is 1, push to puts array.
                // If a call, set the strike to the quote. If a put, set the strike to the base.
                let arrayToPushTo: OptionsAttributes[] = [];
                if (base == "1") {
                    isCall = true;
                    strike = Number(quote);
                    arrayToPushTo = calls;
                }
                if (quote == "1") {
                    isCall = false;
                    strike = Number(base);
                    arrayToPushTo = puts;
                }

                breakEven = calculateBreakeven(strike, price, isCall);

                // Push the option object with the parsed data to the options call or puts array.
                arrayToPushTo.push({
                    breakEven: breakEven,
                    change: change,
                    price: price,
                    strike: strike,
                    volume: volume,
                    address: address,
                    id: id,
                });
            }

            // Get the final options object and dispatch it to set its state for the hook.
            Object.assign(optionsObject, {
                calls: calls,
                puts: puts,
            });
            dispatch(setOptions(optionsObject));
        },
        [dispatch, web3React.library]
    );

    return (
        <OptionsContext.Provider
            value={{
                options: state.options,
                getOptions: handleOptions,
            }}
        >
            {props.children}
        </OptionsContext.Provider>
    );
};

export default Options;
