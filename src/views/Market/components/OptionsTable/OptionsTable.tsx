import React, { useEffect } from "react";
import styled from "styled-components";

import useOrders from "../../../../hooks/useOrders";
import useOptions from "../../../../hooks/useOptions";

import AddIcon from "@material-ui/icons/Add";

import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

import IconButton from "../../../../components/IconButton";
import LitContainer from "../../../../components/LitContainer";
import Table from "../../../../components/Table";
import TableBody from "../../../../components/TableBody";
import TableCell from "../../../../components/TableCell";
import TableRow from "../../../../components/TableRow";

export type FormattedOption = {
    breakEven: number;
    change: number;
    price: number;
    strike: number;
    volume: number;
};

export interface OptionsTableProps {
    options: FormattedOption[];
}

const OptionsTable: React.FC<OptionsTableProps> = (props) => {
    const { options, getOptions } = useOptions();
    const { onAddItem } = useOrders();
    const web3React = useWeb3React();

    useEffect(() => {
        getOptions("0xc45c339313533a6c9B05184CD8B5486BC53F75Fb");
    }, [web3React.library]);

    return (
        <Table>
            <StyledTableHead>
                <LitContainer>
                    <TableRow isHead>
                        <TableCell>Strike Price</TableCell>
                        <TableCell>Break Even</TableCell>
                        <TableCell>24h Volume</TableCell>
                        <TableCell>Change</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Address</TableCell>
                        <StyledButtonCell />
                    </TableRow>
                </LitContainer>
            </StyledTableHead>
            <LitContainer>
                <TableBody>
                    {options.calls.map((option, i) => {
                        const {
                            breakEven,
                            change,
                            price,
                            strike,
                            volume,
                            address,
                        } = option;
                        return (
                            <TableRow key={address}>
                                <TableCell>${strike}</TableCell>
                                <TableCell>${breakEven}</TableCell>
                                <TableCell>${volume}</TableCell>
                                <TableCell>
                                    {(change * 100).toFixed(2)}%
                                </TableCell>
                                <TableCell>${price.toFixed(2)}</TableCell>
                                <TableCell>{address.substring(0, 6)}</TableCell>
                                <StyledButtonCell>
                                    <IconButton
                                        onClick={() => {
                                            onAddItem(option);
                                        }}
                                        variant="outlined"
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </StyledButtonCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </LitContainer>
        </Table>
    );
};

const StyledTableHead = styled.div`
    background-color: ${(props) => props.theme.color.grey[800]};
    border-bottom: 1px solid ${(props) => props.theme.color.grey[600]};
`;

const StyledButtonCell = styled.div`
    width: ${(props) => props.theme.buttonSize}px;
`;

export default OptionsTable;
