import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import Countdown, { CountdownRenderProps } from "react-countdown";
import { useWeb3React } from "@web3-react/core";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import CardContent from "../../../components/CardContent";
import Spacer from "../../../components/Spacer";
import CardIcon from "../../../components/CardIcon";
import Loader from "../../../components/Loader";

import { Market } from "../../../contexts/Markets";
import useMarkets from "../../../hooks/useMarkets";

import { bnToDec } from "../../../utils";

const MarketCards: React.FC = () => {
    const [markets] = useMarkets();
    const { account } = useWeb3React();
    const rows = markets.reduce<Market[][]>(
        (marketRows, market) => {
            const newMarketRows = [...marketRows];
            if (newMarketRows[newMarketRows.length - 1].length === 3) {
                newMarketRows.push([market]);
            } else {
                newMarketRows[newMarketRows.length - 1].push(market);
            }
            return newMarketRows;
        },
        [[]]
    );

    return (
        <StyledCards>
            {!!rows[0].length ? (
                rows.map((marketRow, i) => (
                    <StyledRow key={i}>
                        {marketRow.map((market, j) => (
                            <React.Fragment key={j}>
                                <MarketCard market={market} />
                                {(j === 0 || j === 1) && <StyledSpacer />}
                            </React.Fragment>
                        ))}
                    </StyledRow>
                ))
            ) : (
                <StyledLoadingWrapper>
                    <Loader text="Loading markets" />
                </StyledLoadingWrapper>
            )}
        </StyledCards>
    );
};

interface MarketCardProps {
    market: Market;
}

const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
    const [startTime, setStartTime] = useState(0);

    const { contract } = market;
    const { account } = useWeb3React();

    const renderer = (countdownProps: CountdownRenderProps) => {
        const { hours, minutes, seconds } = countdownProps;
        const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;
        const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const paddedHours = hours < 10 ? `0${hours}` : hours;
        return (
            <span style={{ width: "100%" }}>
                {paddedHours}:{paddedMinutes}:{paddedSeconds}
            </span>
        );
    };

    const poolActive = startTime * 1000 - Date.now() <= 0;
    return (
        <StyledCardWrapper>
            <Card>
                <CardContent>
                    <StyledContent>
                        <CardIcon>{market.icon}</CardIcon>
                        <StyledTitle>{market.name}</StyledTitle>
                        <StyledDetails>
                            <StyledDetail>Trade</StyledDetail>
                        </StyledDetails>
                        <Spacer />
                        <Button
                            disabled={!poolActive}
                            text={poolActive ? "Select" : undefined}
                            to={`/markets/${market.id}`}
                        >
                            {!poolActive && (
                                <Countdown
                                    date={new Date(startTime * 1000)}
                                    renderer={renderer}
                                />
                            )}
                        </Button>
                    </StyledContent>
                </CardContent>
            </Card>
        </StyledCardWrapper>
    );
};

const StyledCardAccent = styled.div`
    background: linear-gradient(
        45deg,
        rgba(255, 0, 0, 1) 0%,
        rgba(255, 154, 0, 1) 10%,
        rgba(208, 222, 33, 1) 20%,
        rgba(79, 220, 74, 1) 30%,
        rgba(63, 218, 216, 1) 40%,
        rgba(47, 201, 226, 1) 50%,
        rgba(28, 127, 238, 1) 60%,
        rgba(95, 21, 242, 1) 70%,
        rgba(186, 12, 248, 1) 80%,
        rgba(251, 7, 217, 1) 90%,
        rgba(255, 0, 0, 1) 100%
    );
    border-radius: 12px;
    filter: blur(4px);
    position: absolute;
    top: -2px;
    right: -2px;
    bottom: -2px;
    left: -2px;
    z-index: -1;
`;

const StyledCards = styled.div`
    width: 900px;
    @media (max-width: 768px) {
        width: 100%;
    }
`;

const StyledLoadingWrapper = styled.div`
    align-items: center;
    display: flex;
    flex: 1;
    justify-content: center;
`;

const StyledRow = styled.div`
    display: flex;
    margin-bottom: ${(props) => props.theme.spacing[4]}px;
    flex-flow: row wrap;
    @media (max-width: 768px) {
        width: 100%;
        flex-flow: column nowrap;
        align-items: center;
    }
`;

const StyledCardWrapper = styled.div`
    display: flex;
    width: calc((900px - ${(props) => props.theme.spacing[4]}px * 2) / 3);
    position: relative;
`;

const StyledTitle = styled.h4`
    color: ${(props) => props.theme.color.grey[600]};
    font-size: 24px;
    font-weight: 700;
    margin: ${(props) => props.theme.spacing[2]}px 0 0;
    padding: 0;
`;

const StyledContent = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
`;

const StyledSpacer = styled.div`
    height: ${(props) => props.theme.spacing[4]}px;
    width: ${(props) => props.theme.spacing[4]}px;
`;

const StyledDetails = styled.div`
    margin-top: ${(props) => props.theme.spacing[2]}px;
    text-align: center;
`;

const StyledDetail = styled.div`
    color: ${(props) => props.theme.color.grey[500]};
`;

const StyledHarvestable = styled.div`
    color: ${(props) => props.theme.color.secondary.main};
    font-size: 16px;
    height: 48px;
    text-align: center;
`;

export default MarketCards;
