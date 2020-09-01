import React from "react";
import ethers from "ethers";
import { ThemeProvider } from "styled-components";
import { BrowserRouter as Router } from "react-router-dom";
import { Web3ReactProvider } from "@web3-react/core";

import TopBar from "./components/TopBar";

import Market from "./views/Market";

import theme from "./theme";

function getLibrary(provider, connector) {
    return new ethers.providers.Web3Provider(provider);
}

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <Web3ReactProvider getLibrary={getLibrary}>
                <Router>
                    <TopBar />
                    <Market />
                </Router>
            </Web3ReactProvider>
        </ThemeProvider>
    );
};

export default App;
