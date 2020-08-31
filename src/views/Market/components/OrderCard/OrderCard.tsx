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

interface OrderCardProps {}

const OrderCard: React.FC<OrderCardProps> = (props) => {
    const [buyCard, setBuyCard] = useState(true);
    const [quantity, setQuantity] = useState();
    const { item, buyOptions, mintOptions } = useOrders();
    const web3React = useWeb3React();
    useEffect(() => {}, [item]);

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
                                Option: {""}
                                {item?.id}
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
                            Option: {""}
                            {item?.id}
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
                        <StyledAvailable>$250,000 Buying Power</StyledAvailable>
                    </>
                ) : (
                    <EmptyContent />
                )}
            </CardContent>
        </Card>
    );
};

const StyledInput = styled.input``;
const StyledLabel = styled.label``;

export default OrderCard;
