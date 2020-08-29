import React, { useEffect } from "react";

import Card from "../../../../components/Card";
import CardContent from "../../../../components/CardContent";
import CardTitle from "../../../../components/CardTitle";

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
                            <h3>
                                item: {i}, {item?.strike}
                            </h3>
                        );
                    })
                ) : (
                    <EmptyContent />
                )}
            </CardContent>
        </Card>
    );
};

export default OrderCard;
