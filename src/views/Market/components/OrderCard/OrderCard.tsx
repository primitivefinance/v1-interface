import React, { useEffect, useState } from "react";
import styled from "styled-components";

import Card from "../../../../components/Card";
import CardContent from "../../../../components/CardContent";
import CardTitle from "../../../../components/CardTitle";
import Button from "../../../../components/Button";

import useOrders from "../../../../hooks/useOrders";
import { useWeb3React } from "@web3-react/core";

import EmptyContent from "./components/EmptyContent";
import { StyledAvailable } from "./components/EmptyContent";

import { destructureOptionSymbol } from "../../../../lib/utils";

interface OrderCardProps {}

const OrderCard: React.FC<OrderCardProps> = (props) => {
    const [buyCard, setBuyCard] = useState(true);
    const [quantity, setQuantity] = useState();
    const {
        item,
        buyOptions,
        mintOptions,
        exerciseOptions,
        closeOptions,
        orderType,
        loadPendingTx,
    } = useOrders();
    const { buyOrMint } = orderType;
    const web3React = useWeb3React();
    useEffect(() => {}, [item]);
    useEffect(() => {
        loadPendingTx();
    }, []);

    const { asset, year, month, day, type, strike } = destructureOptionSymbol(
        item.id
    );

    const handleChange = (event) => {
        setQuantity(event.target.value);
    };

    const onToggle = () => {
        setBuyCard(!buyCard);
    };

    return (
        <Card>
            <CardTitle>Your Order</CardTitle>
            <CardContent>
                {buyOrMint ? (
                    <>
                        <Button
                            onClick={onToggle}
                            text={"Buy"}
                            variant={!buyCard ? "transparent" : "filled"}
                        />
                        <Button
                            onClick={onToggle}
                            text={"Mint"}
                            variant={!buyCard ? "filled" : "transparent"}
                        />
                        {buyCard ? (
                            item.id ? (
                                <>
                                    <h4>
                                        Buying {asset}{" "}
                                        {type == "C" ? "Call" : "Put"} ${strike}{" "}
                                        {month}/{day}/{year}
                                    </h4>
                                    <h4>Price: ${item.price.toFixed(2)}</h4>
                                    <StyledLabel>Quantity: </StyledLabel>
                                    <StyledInput
                                        placeholder="0.00"
                                        type="number"
                                        onChange={handleChange}
                                        value={quantity}
                                    />
                                    <Button
                                        onClick={() => {
                                            buyOptions(
                                                web3React.library,
                                                item?.address,
                                                quantity
                                            );
                                        }}
                                        text="Buy"
                                    />
                                    <StyledAvailable>
                                        $250,000 Buying Power
                                    </StyledAvailable>
                                </>
                            ) : (
                                <EmptyContent />
                            )
                        ) : item.id ? (
                            <>
                                <h4>
                                    Minting {asset}{" "}
                                    {type == "C" ? "Call" : "Put"} ${strike}{" "}
                                    {month}/{day}/{year}
                                </h4>
                                <h4>Price: ${item.price.toFixed(2)}</h4>
                                <StyledLabel>Quantity: </StyledLabel>
                                <StyledInput
                                    placeholder="0.00"
                                    type="number"
                                    onChange={handleChange}
                                    value={quantity}
                                />
                                <Button
                                    onClick={() => {
                                        mintOptions(
                                            web3React.library,
                                            item?.address,
                                            quantity
                                        );
                                    }}
                                    text="Mint"
                                />
                                <StyledAvailable>
                                    $250,000 Buying Power
                                </StyledAvailable>
                            </>
                        ) : (
                            <EmptyContent />
                        )}{" "}
                    </>
                ) : (
                    <>
                        <Button
                            onClick={onToggle}
                            text={"Exercise"}
                            variant={!buyCard ? "transparent" : "filled"}
                        />
                        <Button
                            onClick={onToggle}
                            text={"Close"}
                            variant={!buyCard ? "filled" : "transparent"}
                        />
                        {buyCard ? (
                            item.id ? (
                                <>
                                    <h4>
                                        Exercising {asset}{" "}
                                        {type == "C" ? "Call" : "Put"} ${strike}{" "}
                                        {month}/{day}/{year}
                                    </h4>
                                    <h4>Price: ${item.price.toFixed(2)}</h4>
                                    <StyledLabel>Quantity: </StyledLabel>
                                    <StyledInput
                                        placeholder="0.00"
                                        type="number"
                                        onChange={handleChange}
                                        value={quantity}
                                    />
                                    <Button
                                        onClick={() => {
                                            exerciseOptions(
                                                web3React.library,
                                                item?.address,
                                                quantity
                                            );
                                        }}
                                        text="Exercise"
                                    />
                                    <StyledAvailable>
                                        $250,000 Buying Power
                                    </StyledAvailable>
                                </>
                            ) : (
                                <EmptyContent />
                            )
                        ) : item.id ? (
                            <>
                                <h4>
                                    Closing {asset}{" "}
                                    {type == "C" ? "Call" : "Put"} ${strike}{" "}
                                    {month}/{day}/{year}
                                </h4>
                                <h4>Price: ${item.price.toFixed(2)}</h4>
                                <StyledLabel>Quantity: </StyledLabel>
                                <StyledInput
                                    placeholder="0.00"
                                    type="number"
                                    onChange={handleChange}
                                    value={quantity}
                                />
                                <Button
                                    onClick={() => {
                                        closeOptions(
                                            web3React.library,
                                            item?.address,
                                            quantity
                                        );
                                    }}
                                    text="Close"
                                />
                                <StyledAvailable>
                                    $250,000 Buying Power
                                </StyledAvailable>
                            </>
                        ) : (
                            <EmptyContent />
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

const StyledInput = styled.input``;
const StyledLabel = styled.label``;

export default OrderCard;
