import React, { useState } from "react";
import styled from "styled-components";
import ethers from "ethers";
import { parseEther } from "ethers/lib/utils";

import ToggleButton from "../../../../components/ToggleButton";
import Select from "../../../../components/Select";
import LitContainer from "../../../../components/LitContainer";

import Trader from "../../../../artifacts/Trader.json";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

interface MintingFormProps {}

const assets = ["ETH", "YFI"];
const stablecoins = ["DAI", "sUSD"];
const expiries = ["June"];
const options = ["Ether112C00500"];

const MintingForm: React.FC<MintingFormProps> = (props) => {
    const [callPutActive, setCallPutActive] = useState(false);
    const [quantity, setQuantity] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        await mintOptions(quantity);
    };

    const injected = new InjectedConnector({
        supportedChainIds: [1, 3, 4, 5, 42],
    });
    const web3React = useWeb3React();

    const mintOptions = async (amount) => {
        let traderAddress = "0x615a04282a457b2Dd73Fa297A22114ABE3E812cF";
        let optionAddress = "0x05b8dAD398d12d2bd36e1a38e97c3692e7fAFcec";
        let receiver = web3React.account;
        const signer = await web3React.library.getSigner();
        let trader = new ethers.Contract(traderAddress, Trader.abi, signer);
        console.log("Minting", amount, "for", receiver);
        try {
            await trader.safeMint(optionAddress, parseEther(amount), receiver);
        } catch (err) {
            console.log("Minting error: ", err);
        }
    };
    return (
        <StyledHeader>
            <StyledTitle>
                <StyledName>{"Mint Options"}</StyledName>
                <StyledSymbol>{}</StyledSymbol>
            </StyledTitle>
            <StyledPrice>{}</StyledPrice>
            <StyledForm onSubmit={handleSubmit}>
                <Select selections={options} />
                <StyledLabel form="quantity">
                    Quantity:
                    <StyledInput
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    ></StyledInput>
                </StyledLabel>
                <StyledInput type="submit" value="submit" />
            </StyledForm>
        </StyledHeader>
    );
};

const StyledForm = styled.form`
    padding-bottom: ${(props) => props.theme.spacing[4]}px;
    padding-top: ${(props) => props.theme.spacing[4]}px;
`;

const StyledHeader = styled.div`
    background-color: ${(props) => props.theme.color.grey[800]};
    padding-bottom: ${(props) => props.theme.spacing[4]}px;
    padding-top: ${(props) => props.theme.spacing[4]}px;
`;

const StyledTitle = styled.div`
    align-items: baseline;
    display: flex;
    margin-top: ${(props) => props.theme.spacing[2]}px;
`;

const StyledName = styled.span`
    font-size: 24px;
    font-weight: 700;
    margin-right: ${(props) => props.theme.spacing[2]}px;
`;

const StyledInput = styled.input``;
const StyledLabel = styled.label``;

const StyledSymbol = styled.span`
    color: ${(props) => props.theme.color.grey[400]};
    letter-spacing: 1px;
    text-transform: uppercase;
`;

const StyledPrice = styled.span`
    font-size: 24px;
    font-weight: 700;
`;

export default MintingForm;
