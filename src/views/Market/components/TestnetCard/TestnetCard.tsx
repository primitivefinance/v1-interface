import React, { useEffect } from "react";
import styled from "styled-components";
import Button from "../../../../components/Button";

import useOrders from "../../../../hooks/useOrders";
import { useWeb3React } from "@web3-react/core";

interface TestnetCardProps {}

const TestnetCard: React.FC<TestnetCardProps> = () => {
    const { item, loadPendingTx, mintTestTokens } = useOrders();
    const { library } = useWeb3React();
    useEffect(() => {}, [item]);
    useEffect(() => {
        (async () => {
            loadPendingTx();
        })();
    }, [loadPendingTx]);

    const handleMintTestTokens = async () => {
        await mintTestTokens(
            library,
            "0xBa8980CA505E7f48a177BBfA3AB90c9F01699110",
            100
        );
    };

    return (
        <StyledContainer>
            <Button
                onClick={handleMintTestTokens}
                text={"Get Test Tokens"}
                variant="secondary"
            />
        </StyledContainer>
    );
};

const StyledContainer = styled.div`
    margin-top: 24px;
    display: flex;
    justify-content: center;
`;

export default TestnetCard;
