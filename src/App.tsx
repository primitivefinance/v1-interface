import React from "react";
import ethers from "ethers";
import { ThemeProvider } from "styled-components";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Web3ReactProvider } from "@web3-react/core";

import TopBar from "./components/TopBar";

import Market from "./views/Market";
import Portfolio from "./views/Portfolio";

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
                    <Switch>
                        <Route exact path="/" component={Market} />
                    </Switch>
                    <Switch>
                        <Route exact path="/portfolio" component={Portfolio} />
                    </Switch>
                </Router>
            </Web3ReactProvider>
        </ThemeProvider>
    );
};

export default App;
