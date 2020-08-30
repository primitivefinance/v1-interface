import React from "react";

import Card from "../../../../components/Card";
import CardContent from "../../../../components/CardContent";
import CardTitle from "../../../../components/CardTitle";

import MintingForm from "../MintingForm";

import useOrders from "../../../../hooks/useOrders";

interface MintingCardProps {}

const MintingCard: React.FC<MintingCardProps> = (props) => {
    const { item } = useOrders();
    return (
        <Card>
            <CardTitle>Mint Options</CardTitle>
            <CardContent>
                <MintingForm />
            </CardContent>
        </Card>
    );
};

export default MintingCard;
