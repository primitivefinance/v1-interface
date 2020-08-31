import ERC20 from "@primitivefi/contracts/artifacts/ERC20.json";
import Option from "@primitivefi/contracts/artifacts/Option.json";
import Trader from "@primitivefi/contracts/artifacts/Trader.json";
import TraderRinkeby from "@primitivefi/contracts/deployments/rinkeby/Trader.json";
import { ethers } from "ethers";

import { parseEther } from "ethers/lib/utils";

const MIN_ALLOWANCE = parseEther("10000000");

const checkAllowance = async (signer, tokenAddress, spenderAddress) => {
    let token = new ethers.Contract(tokenAddress, ERC20.abi, signer);
    let owner = await signer.getAddress();
    let allowance = await token.allowance(owner, spenderAddress);
    if (allowance < MIN_ALLOWANCE) {
        await token.approve(spenderAddress, MIN_ALLOWANCE);
    }
};

const getTraderAddress = (chainId) => {
    let address;
    if (chainId == "4") {
        address = TraderRinkeby.address;
    }

    return address;
};

const mint = async (signer, quantity, optionAddress) => {
    const chain = await signer.getChainId();
    const traderAddress = getTraderAddress(chain);
    const trader = new ethers.Contract(traderAddress, Trader.abi, signer);
    const account = await signer.getAddress();
    const option = new ethers.Contract(optionAddress, Option.abi, signer);
    const underlyingAddress = await option.getUnderlyingTokenAddress();
    const mintQuantity = parseEther(quantity).toString();

    await checkAllowance(signer, underlyingAddress, traderAddress);

    try {
        await trader.safeMint(optionAddress, mintQuantity, account);
    } catch (err) {
        console.log("Error on minting: ", err);
    }
};

export { mint };
