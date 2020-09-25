/* import { Contract } from "web3-eth-contract"; */
import { Contract } from "ethers";

export interface Market {
    contract: Contract;
    name: string;
    depositToken: string;
    depositTokenAddress: string;
    earnToken: string;
    earnTokenAddress: string;
    icon: React.ReactNode;
    id: string;
    sort: number;
}

export interface MarketsContext {
    markets: Market[];
    unharvested: number;
}
