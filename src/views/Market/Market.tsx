import React, { useState } from "react";
import styled from "styled-components";

import OrderProvider from "../../contexts/Order";
import PricesProvider from "../../contexts/Prices";
import OptionsProvider from "../../contexts/Options";

import FilterBar from "./components/FilterBar";
import MarketHeader from "./components/MarketHeader";
import OptionsTable from "./components/OptionsTable";
import OrderCard from "./components/OrderCard";

const mockOptions = [
    { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
    { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
    { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
    { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
    { breakEven: 550, change: 0.075, price: 10, strike: 500, volume: 1000000 },
];

const Market: React.FC = () => {
    const [callPutActive, setCallPutActive] = useState(true);

    const handleFilter = () => {
        setCallPutActive(!callPutActive);
    };
    return (
        <PricesProvider>
            <OrderProvider>
                <OptionsProvider>
                    <StyledMarket>
                        <StyledMain>
                            <MarketHeader name="Ethereum" symbol="ETH" />
                            <FilterBar
                                active={callPutActive}
                                setCallActive={handleFilter}
                            />
                            <OptionsTable
                                options={mockOptions}
                                callActive={callPutActive}
                            />
                        </StyledMain>
                        <StyledSideBar>
                            <OrderCard />
                        </StyledSideBar>
                    </StyledMarket>
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
