import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import NotificationsIcon from "@material-ui/icons/Notifications";

import Container from "../Container";
import IconButton from "../IconButton";
import Logo from "../Logo";

import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

export const connect = async (web3React, injected) => {
    try {
        await web3React.activate(injected);
    } catch (err) {
        console.log(err);
    }
};

export const disconnect = async (web3React) => {
    try {
        await web3React.deactivate();
    } catch (err) {
        console.log(err);
    }
};

const TopBar: React.FC = () => {
    const [isMarkets, setIsMarkets] = useState(true);
    const location = useLocation();
    const injected = new InjectedConnector({
        supportedChainIds: [1, 3, 4, 5, 42],
    });
    const web3React = useWeb3React();
    console.log(location.hash);
    return (
        <StyledTopBar>
            <Container alignItems="center" display="flex" height={72}>
                <StyledFlex>
                    <Logo />
                </StyledFlex>
                <StyledNav>
                    <StyledNavItem
                        active={
                            location.pathname == "/portfolio" ? true : false
                        }
                        to="/portfolio"
                    >
                        Portfolio
                    </StyledNavItem>
                    <StyledNavItem
                        active={location.pathname == "/markets" ? true : false}
                        to="/markets"
                    >
                        Markets
                    </StyledNavItem>
                </StyledNav>
                <StyledFlex>
                    <StyledFlex />
                    <IconButton onClick={() => {}} variant="transparent">
                        <NotificationsIcon />
                    </IconButton>
                    <IconButton
                        onClick={async () => {
                            connect(web3React, injected);
                        }}
                        variant="transparent"
                    >
                        <AccountCircleIcon />
                    </IconButton>
                </StyledFlex>
            </Container>
        </StyledTopBar>
    );
};

const StyledTopBar = styled.div`
    background-color: ${(props) => props.theme.color.black};
    border-bottom: 1px solid ${(props) => props.theme.color.grey[600]};
    color: ${(props) => props.theme.color.white};
    display: flex;
    height: 72px;
`;

const StyledFlex = styled.div`
    align-items: center;
    display: flex;
    flex: 1;
`;

const StyledNav = styled.div`
    display: flex;
    flex: 1;
    font-weight: 700;
    justify-content: center;
`;

interface StyledNavItemProps {
    active?: boolean;
}

const StyledNavItem = styled(Link)<StyledNavItemProps>`
    color: ${(props) =>
        props.active ? props.theme.color.white : props.theme.color.grey[400]};
    padding-left: ${(props) => props.theme.spacing[3]}px;
    padding-right: ${(props) => props.theme.spacing[3]}px;
    text-decoration: none;
    &:hover {
        color: ${(props) => props.theme.color.white};
    }
`;

export default TopBar;
