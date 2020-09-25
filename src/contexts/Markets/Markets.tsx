import React, { useCallback, useEffect, useState } from "react";

import { useWeb3React } from "@web3-react/core";
import { Contract } from "web3-eth-contract";
import { bnToDec } from "../../utils";

import useOptions from "../../hooks/useOptions";
import { getContracts, getContract } from "../../lib/primitive";

import Context from "./context";
import { Market } from "./types";
import { BigNumber, ethers } from "ethers";

const NAME_FOR_POOL: { [key: string]: string } = {
    yfi_pool: "YFI Market",
    eth_pool: "Weth Homestead",
    ampl_pool: "Ample Soils",
    ycrv_pool: "Eternal Lands",
    comp_pool: "Compounding Hills",
    link_pool: "Marine Gardens",
    lend_pool: "Aave Agriculture",
    snx_pool: "Spartan Grounds",
    mkr_pool: "Maker Range",
};

const ICON_FOR_POOL: { [key: string]: string } = {
    yfi_pool: "🐋",
    eth_pool: "🌎",
    ampl_pool: "🌷",
    comp_pool: "💸",
    link_pool: "🔗",
    lend_pool: "🏕️",
    snx_pool: "⚔️",
    mkr_pool: "🐮",
    ycrv_pool: "🌈",
};

const SORT_FOR_POOL: { [key: string]: number } = {
    yfi_pool: 0,
    eth_pool: 1,
    ampl_pool: 2,
    comp_pool: 3,
    ycrv_pool: 4,
    link_pool: 5,
    lend_pool: 6,
    snx_pool: 7,
    mkr_pool: 8,
};

const Markets: React.FC = ({ children }) => {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [unharvested, setUnharvested] = useState(0);

    const { account } = useWeb3React();
    const options = useOptions();

    const fetchPools = useCallback(async () => {
        /* const pools: { [key: string]: Contract } = await getContracts(
            "0x05b8dAD398d12d2bd36e1a38e97c3692e7fAFcec"
        ); */

        const marketsArr: Market[] = [];
        //const poolKeys = Object.keys(pools);

        /* for (let i = 0; i < poolKeys.length; i++) {
            const poolKey = poolKeys[i];
            const pool = pools[poolKey];
            let tokenKey = poolKey.replace("_pool", "");
            if (tokenKey === "eth") {
                tokenKey = "weth";
            } else if (tokenKey === "ampl") {
                tokenKey = "ampl_eth_uni_lp";
            } else if (tokenKey === "ycrv") {
                tokenKey = "options_uni_lp";
            }

            const method = pool.methods[tokenKey];
            try {
                let tokenAddress = "";
                if (method) {
                    tokenAddress = await method().call();
                } else if (tokenKey === "options_uni_lp") {
                    tokenAddress = "0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8";
                }
                marketsArr.push({
                    contract: await getContract(
                        "0x05b8dAD398d12d2bd36e1a38e97c3692e7fAFcec"
                    ),
                    name: NAME_FOR_POOL[poolKey],
                    depositToken: tokenKey,
                    depositTokenAddress: tokenAddress,
                    earnToken: "",
                    earnTokenAddress: "0x0",
                    icon: ICON_FOR_POOL[poolKey],
                    id: tokenKey,
                    sort: SORT_FOR_POOL[poolKey],
                });
            } catch (e) {
                console.log(e);
            }
        } */

        marketsArr.push({
            contract: await getContract(
                "0x05b8dAD398d12d2bd36e1a38e97c3692e7fAFcec"
            ),
            name: "Test",
            depositToken: "",
            depositTokenAddress: "0x0",
            earnToken: "none",
            earnTokenAddress: "0x0",
            icon: "",
            id: "0",
            sort: 0,
        });
        marketsArr.sort((a, b) => (a.sort < b.sort ? 1 : -1));
        setMarkets(marketsArr);
    }, [options, setMarkets]);

    useEffect(() => {
        if (options) {
            fetchPools();
        }
    }, [options, fetchPools]);

    useEffect(() => {
        async function fetchUnharvested() {
            const unharvestedBalances = await Promise.all(
                markets.map(async (market: Market) => {
                    return 1;
                })
            );
            const totalBal = unharvestedBalances.reduce(
                (acc, val) => acc + val
            );
            setUnharvested(totalBal);
        }
        if (account && markets.length && options) {
            fetchUnharvested();
        }
    }, [account, markets, setUnharvested, options]);

    return (
        <Context.Provider
            value={{
                markets,
                unharvested,
            }}
        >
            {children}
        </Context.Provider>
    );
};

export default Markets;
