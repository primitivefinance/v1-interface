import React, { useEffect } from "react";
import styled from "styled-components";

import Card from "../../../../components/Card";
import CardContent from "../../../../components/CardContent";
import CardTitle from "../../../../components/CardTitle";
import Button from "../../../../components/Button";

import useOrders from "../../../../hooks/useOrders";

import EmptyContent from "./components/EmptyContent";

interface OrderCardProps {}

const OrderCard: React.FC<OrderCardProps> = (props) => {
    const { items } = useOrders();
    useEffect(() => {}, [items]);
    return (
        <Card>
            <CardTitle>Your Order</CardTitle>
            <CardContent>
                {items.length > 0 ? (
                    items.map((item, i) => {
                        return (
                            <>
                                <h4>
                                    Option: {""}
                                    {item?.id}
                                </h4>
                                <h4>Price: ${item.price.toFixed(2)}</h4>
                                <StyledLabel>Quantity: </StyledLabel>
                                <StyledInput placeholder="0.00" type="number" />
                                <Button onClick={() => {}} text="Submit" />
                            </>
                        );
                    })
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
