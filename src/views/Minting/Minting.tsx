import React from "react";
import styled from "styled-components";
import ethers from "ethers";

import OrderProvider from "../../contexts/Order";

import MintingCard from "../Minting/components/MintingCard";

const Minting: React.FC = () => {
    return (
        <OrderProvider>
            <StyledMinting>
                <StyledMain>
                    <StyledSideBar>
                        <MintingCard />
                    </StyledSideBar>
                </StyledMain>
            </StyledMinting>
        </OrderProvider>
    );
};

const StyledMain = styled.div``;

const StyledMinting = styled.div`
    display: flex;
`;

const StyledSideBar = styled.div`
    box-sizing: border-box;
    min-height: calc(100vh - 72px);
    padding: ${(props) => props.theme.spacing[4]}px;
    width: 800px;
`;

export default Minting;
