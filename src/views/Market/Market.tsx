import React, { useState, useEffect } from "react";
import styled from "styled-components";

import OrderProvider from "../../contexts/Order";
import PricesProvider from "../../contexts/Prices";
import OptionsProvider from "../../contexts/Options";
import PositionsProvider from "../../contexts/Positions";

import FilterBar from "./components/FilterBar";
import MarketHeader from "./components/MarketHeader";
import OptionsTable from "./components/OptionsTable";
import PositionsTable from "./components/PositionsTable";
import OrderCard from "./components/OrderCard";
import PositionsHeader from "./components/PositionsHeader";

import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

const mockOptions = [
    { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
    { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
    { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
    { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
    { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
];

const Market: React.FC = () => {
    const [callPutActive, setCallPutActive] = useState(true);

    // Web3

    const { activate } = useWeb3React();
    // Connect to web3 automatically using injected
    useEffect(() => {
        (async () => {
            try {
                const injected = new InjectedConnector({
                    supportedChainIds: [1, 3, 4, 5, 42],
                });
                await activate(injected);
            } catch (err) {
                console.log(err);
            }
        })();
    }, [activate]);

    const handleFilter = () => {
        setCallPutActive(!callPutActive);
    };
    return (
        <PricesProvider>
            <OrderProvider>
                <OptionsProvider>
                    <PositionsProvider>
                        <StyledMarket>
                            <StyledMain>
                                <MarketHeader name="Ethereum" symbol="ETH" />
                                <FilterBar
                                    active={callPutActive}
                                    setCallActive={handleFilter}
                                />
                                <OptionsTable
                                    options={mockOptions}
                                    asset="Ethereum"
                                    callActive={callPutActive}
                                />
                                <PositionsHeader name="Ethereum" symbol="ETH" />
                                <PositionsTable
                                    positions={mockOptions}
                                    asset="Ethereum"
                                    callActive={callPutActive}
                                />
                            </StyledMain>
                            <StyledSideBar>
                                <OrderCard />
                            </StyledSideBar>
                        </StyledMarket>
                    </PositionsProvider>
                </OptionsProvider>
            </OrderProvider>
        </PricesProvider>
    );
};

const StyledMain = styled.div``;

const StyledMarket = styled.div`
    display: flex;
`;

const StyledSideBar = styled.div`
    border-left: 1px solid ${(props) => props.theme.color.grey[600]};
    box-sizing: border-box;
    min-height: calc(100vh - 72px);
    padding: ${(props) => props.theme.spacing[4]}px;
    width: 400px;
`;

export default Market;
