import React, { useEffect } from "react";
import styled from "styled-components";

import OrderProvider from "../../contexts/Order";
import PricesProvider from "../../contexts/Prices";
import OptionsProvider from "../../contexts/Options";
import PositionsProvider from "../../contexts/Positions";

import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

import CreateCard from "./components/CreateCard";

const Create: React.FC = () => {
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

    return (
        <PricesProvider>
            <OrderProvider>
                <OptionsProvider>
                    <PositionsProvider>
                        <StyledCreate>
                            <StyledMain>
                                <CreateCard />
                            </StyledMain>
                        </StyledCreate>
                    </PositionsProvider>
                </OptionsProvider>
            </OrderProvider>
        </PricesProvider>
    );
};

const StyledMain = styled.div`
    font-size: 36px;
`;

const StyledCreate = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 72px);
`;

export default Create;
