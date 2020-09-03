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

const getTrader = async (signer) => {
    const chain = await signer.getChainId();
    const traderAddress = getTraderAddress(chain);
    const trader = new ethers.Contract(traderAddress, Trader.abi, signer);
    return { traderAddress, trader };
};

const mint = async (signer, quantity, optionAddress) => {
    const account = await signer.getAddress();
    const { traderAddress, trader } = await getTrader(signer);
    const option = new ethers.Contract(optionAddress, Option.abi, signer);
    const underlyingAddress = await option.getUnderlyingTokenAddress();
    const mintQuantity = parseEther(quantity).toString();

    await checkAllowance(signer, underlyingAddress, traderAddress);

    let tx;
    try {
        tx = await trader.safeMint(optionAddress, mintQuantity, account);
    } catch (err) {
        console.log("Error on minting: ", err);
    }

    console.log(tx);
    return tx;
};

const exercise = async (signer, quantity, optionAddress) => {
    const account = await signer.getAddress();
    const { traderAddress, trader } = await getTrader(signer);
    const option = new ethers.Contract(optionAddress, Option.abi, signer);
    const strikeAddress = await option.getStrikeTokenAddress();
    const exerciseQuantity = parseEther(quantity).toString();

    await checkAllowance(signer, strikeAddress, traderAddress);
    await checkAllowance(signer, optionAddress, traderAddress);

    let tx;
    try {
        tx = await trader.safeExercise(
            optionAddress,
            exerciseQuantity,
            account
        );
    } catch (err) {
        console.log("Error on exercising: ", err);
    }

    return tx;
};

const redeem = async (signer, quantity, optionAddress) => {
    const account = await signer.getAddress();
    const { traderAddress, trader } = await getTrader(signer);
    const option = new ethers.Contract(optionAddress, Option.abi, signer);
    const redeemAddress = await option.redeemToken();
    const redeemQuantity = parseEther(quantity).toString();

    await checkAllowance(signer, redeemAddress, traderAddress);

    let tx;
    try {
        tx = await trader.safeRedeem(optionAddress, redeemQuantity, account);
    } catch (err) {
        console.log("Error on redeeming: ", err);
    }

    return tx;
};

const close = async (signer, quantity, optionAddress) => {
    const account = await signer.getAddress();
    const { traderAddress, trader } = await getTrader(signer);
    const option = new ethers.Contract(optionAddress, Option.abi, signer);
    const redeemAddress = await option.redeemToken();
    const closeQuantity = parseEther(quantity).toString();

    await checkAllowance(signer, redeemAddress, traderAddress);
    await checkAllowance(signer, optionAddress, traderAddress);

    let tx;
    try {
        tx = await trader.safeClose(optionAddress, closeQuantity, account);
    } catch (err) {
        console.log("Error on closing: ", err);
    }

    return tx;
};

export { mint, exercise, redeem, close };
