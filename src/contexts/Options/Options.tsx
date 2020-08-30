import React, { useCallback, useReducer, useEffect } from "react";
import ethers from "ethers";
import { parseEther } from "ethers/lib/utils";
import UniswapFactoryArtifact from "@uniswap/v2-core/build/UniswapV2Factory.json";
import UniswapPairArtifact from "@uniswap/v2-core/build/UniswapV2Pair.json";
import {
    Token,
    WETH,
    Fetcher,
    Trade,
    TokenAmount,
    TradeType,
    Route,
    Percent,
} from "@uniswap/sdk";

import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

import OptionsContext from "./context";
import optionsReducer, { initialState, setOptions } from "./reducer";
import { OptionsData, EmptyAttributes, OptionsAttributes } from "./types";

import OptionDeployments from "./options_deployments.json";
import AssetAddresses from "./assets.json";
import { formatEther } from "ethers/lib/utils";
const UniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

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

    const calculateBreakeven = (strike, price, isCall) => {
        let breakeven;
        if (isCall) {
            breakeven = price + strike;
        } else {
            breakeven = price + strike;
        }
        return Number(breakeven);
    };

    /* const getPair = async (providerOrSigner, optionAddr) => {
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

        premium = reserves._reserve0 / reserves._reserve1;
        openInterest = reserves._reserve0;

        if (premium > 10 ** 18) {
            premium = Number(formatEther(premium.toString()));
        }
        return { premium, openInterest };
    }; */

    const checkProvider = (...args) => {
        if (!provider) {
            console.error("No connected provider");
            return { ...args };
        }
    };

    /**
     *
     * @param optionAddress The address of the option token to get a uniswap pair of.
     * @param stablecoinAddress The address of the stablecoin token to get the uniswap pair of.
     */
    const getPairData = async (optionAddress) => {
        let premium = 0;

        // Check to make sure we are connected to a web3 provider.
        checkProvider();
        let signer = await provider.getSigner();
        let chain = await signer.getChainId();

        const OPTION = new Token(chain, optionAddress, 18);
        const STABLECOIN = new Token(
            chain,
            "0xb05cB19b19e09c4c7b72EA929C8CfA3187900Ad2",
            18
        );

        const pair = await Fetcher.fetchPairData(STABLECOIN, OPTION);
        const route = new Route([pair], STABLECOIN, OPTION);
        const midPrice = route.midPrice.toSignificant(6);

        const trade = new Trade(
            route,
            new TokenAmount(OPTION, parseEther("1").toString()),
            TradeType.EXACT_OUTPUT
        );
        const executionPrice = trade.executionPrice.toSignificant(6);
        premium = Number(executionPrice);
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
            const provider = web3React.library;
            const signer = await provider.getSigner();
            const chain = await signer.getChainId();
            let assetAddress = getAssetAddress(assetName, chain);
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
                price = Number(premium);
                console.log({ premium });

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
