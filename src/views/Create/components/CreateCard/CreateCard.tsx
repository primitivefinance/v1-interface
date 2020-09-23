import React, { useEffect, useState } from "react";
import styled from "styled-components";

import Card from "../../../../components/Card";
import CardContent from "../../../../components/CardContent";
import CardTitle from "../../../../components/CardTitle";
import Button from "../../../../components/Button";

import { useWeb3React } from "@web3-react/core";
import useOrder from "../../../../hooks/useOrders";

import Assets from "../../../../contexts/Options/assets.json";
import Expiries from "../../../../contexts/Options/expiries_simple.json";

interface CreateCardProps {}

const CreateCard: React.FC<CreateCardProps> = (props) => {
    const { library, chainId } = useWeb3React();
    const { createOption } = useOrder();
    const assets = Object.keys(Assets);
    const expiries = Expiries.timestamps;
    const [expiry, setExpiry] = useState(expiries[0]);
    const [asset, setAsset] = useState(Assets[assets[0]][chainId || 1]);
    const [strike, setStrike] = useState(0);
    const [isCallType, setIsCallType] = useState(true);

    useEffect(() => {}, [chainId, library]);
    useEffect(() => {}, [asset, expiry, strike, isCallType]);

    const handleChange = (event) => {
        event.preventDefault();
        let name = event.target.name;
        let val = event.target.value;
        switch (name) {
            case "strike":
                console.log("setting strike");
                setStrike(Number(val));
                break;
            case "expiry":
                setExpiry(val);
                break;
            case "asset":
                setAsset(val);
                break;
            default:
                break;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("Submitting: ", { asset, expiry, strike, isCallType });
        createOption(library, asset, isCallType, expiry, strike);
    };

    const onToggle = () => {
        setIsCallType(!isCallType);
    };

    const getSimpleDate = (timestamp) => {
        let date = new Date(timestamp * 1000);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    return (
        <Card>
            <CardTitle>Create Option</CardTitle>
            <CardContent>
                <StyledForm onSubmit={handleSubmit}>
                    <StyledLabel>
                        Type
                        <Button
                            onClick={onToggle}
                            text={"Call"}
                            variant={!isCallType ? "tertiary" : "default"}
                        />
                        <Button
                            onClick={onToggle}
                            text={"Put"}
                            variant={!isCallType ? "default" : "tertiary"}
                        />
                    </StyledLabel>
                    <StyledLabel>
                        Underlying Asset
                        <StyledSelect
                            autoFocus
                            value={asset}
                            onChange={handleChange}
                            name="asset"
                        >
                            {assets.map((selection, i) => {
                                return (
                                    <StyledOption
                                        key={i}
                                        value={Assets[selection][chainId]}
                                    >
                                        {selection}
                                    </StyledOption>
                                );
                            })}
                        </StyledSelect>
                    </StyledLabel>
                    <Spacing />
                    <StyledLabel>
                        Expiry
                        <StyledSelect
                            value={expiry}
                            onChange={handleChange}
                            name="expiry"
                        >
                            {expiries.map((selection, i) => {
                                return (
                                    <StyledOption key={i} value={selection}>
                                        {getSimpleDate(selection)}
                                    </StyledOption>
                                );
                            })}
                        </StyledSelect>
                    </StyledLabel>
                    <Spacing />
                    <StyledLabel>
                        Strike Price
                        <StyledInput
                            type="number"
                            placeholder="0.00"
                            onChange={handleChange}
                            name="strike"
                        ></StyledInput>
                    </StyledLabel>
                    <Spacing />
                    <StyledInput
                        type="submit"
                        value="Create Option"
                    ></StyledInput>
                </StyledForm>
            </CardContent>
        </Card>
    );
};

const Spacing = styled.div`
    min-width: 1em;
    min-height: 1em;
`;

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
`;
const StyledSelect = styled.select`
    display: flex;
    justify-content: space-evenly;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    box-sizing: border-box;

    border: none;
    border-bottom: 0.5px solid #bdbdbd;

    font-size: 1em;
    padding-left: 0.25em;
    padding-top: 0.25em;
    min-width: 10em;

    :focus {
        border-color: #5eaefe;
        outline: none;
    }
`;
const StyledOption = styled.option``;
const StyledInput = styled.input`
    display: flex;
    justify-content: space-evenly;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    box-sizing: border-box;

    border: none;
    border-bottom: 0.5px solid #bdbdbd;

    font-size: 1em;
    padding-left: 0.25em;
    padding-top: 0.25em;
    min-width: 10em;

    :focus {
        border-color: #5eaefe;
        outline: none;
    }
`;
const StyledLabel = styled.label``;

export default CreateCard;
