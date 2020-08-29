import React, { useCallback, useReducer, useEffect } from "react";
import ethers from "ethers";
import UniswapFactoryArtifact from "@uniswap/v2-core/build/UniswapV2Factory.json";
import UniswapPairArtifact from "@uniswap/v2-core/build/UniswapV2Pair.json";

import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

import OptionsContext from "./context";
import optionsReducer, { initialState, setOptions } from "./reducer";
import { OptionsData, EmptyAttributes, OptionsAttributes } from "./types";

import OptionDeployments from "./options_deployments.json";
const UniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

const Options: React.FC = (props) => {
    const [state, dispatch] = useReducer(optionsReducer, initialState);
    const web3React = useWeb3React();
    const injected = new InjectedConnector({
        supportedChainIds: [1, 3, 4, 5, 42],
    });
    useEffect(() => {
        (async () => {
            try {
                await web3React.activate(injected);
            } catch (err) {
                console.log(err);
            }
        })();
    }, []);

    /* options = {
        calls: {
            [key] : { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
        },
        puts: {
            { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
        }
    } */

    const getPair = async (providerOrSigner, optionAddr) => {
        let poolAddr = ethers.constants.AddressZero;
        const signer = await providerOrSigner.getSigner();
        const uniFac = new ethers.Contract(
            UniswapFactoryAddress,
            UniswapFactoryArtifact.abi,
            signer
        );
        poolAddr = await uniFac.getPair(
            optionAddr,
            "0xb05cB19b19e09c4c7b72EA929C8CfA3187900Ad2"
        );

        return poolAddr;
    };

    const getPairData = async (optionAddress) => {
        let premium = 0;
        let openInterest = 0;
        const provider = web3React.library;
        if (!provider) {
            console.error("No connected provider");
            return { premium, openInterest };
        }
        const pairAddress = await getPair(provider, optionAddress);
        let signer = await provider.getSigner();
        // need price to calc premium + breakeven, total liquidity for option, volume
        const pair = new ethers.Contract(
            pairAddress,
            UniswapPairArtifact.abi,
            signer
        );
        const token0 = await pair.token0();
        const reserves = await pair.getReserves();

        if (token0 == optionAddress) {
            premium = await pair.price0CumulativeLast();
            openInterest = reserves._reserve0;
        } else {
            premium = await pair.price1CumulativeLast();
            openInterest = reserves._reserve1;
        }

        if (premium == 0) {
            premium = reserves._reserve0 / reserves._reserve1;
        }
        return { premium, openInterest };
    };

    const handleOptions = useCallback(
        async (assetAddress) => {
            let optionsObject = {
                calls: [EmptyAttributes],
                puts: [EmptyAttributes],
            };
            let optionsLength = Object.keys(OptionDeployments).length;
            let calls: OptionsAttributes[] = [];
            let puts: OptionsAttributes[] = [];
            for (let i = 0; i < optionsLength; i++) {
                // Get the parameters for the option object in the option_deployments json file.
                let key = Object.keys(OptionDeployments)[i];
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

                // Get the option price data from uniswap pair.
                const { premium, openInterest } = await getPairData(address);
                price = premium;
                console.log({ premium });

                // If the base is 1, push to calls array. If quote is 1, push to puts array.
                // If a call, set the strike to the quote. If a put, set the strike to the base.
                let arrayToPushTo: OptionsAttributes[] = [];
                if (base == "1") {
                    strike = quote;
                    arrayToPushTo = calls;
                }

                if (quote == "1") {
                    strike = base;
                    arrayToPushTo = puts;
                }

                // Push the option object with the parsed data to the options call or puts array.
                arrayToPushTo.push({
                    breakEven: breakEven,
                    change: change,
                    price: price,
                    strike: Number(strike),
                    volume: volume,
                    address: address,
                });
            }

            // Get the final options object and dispatch it to set its state for the hook.
            Object.assign(optionsObject, {
                calls: calls,
                puts: puts,
            });
            console.log(optionsObject);
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
