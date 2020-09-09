import ERC20 from "@primitivefi/contracts/artifacts/ERC20.json";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";

const destructureOptionSymbol = (symbol) => {
    // symbol = ASSET yyyy mm dd TYPE STRIKE
    // 0-5 asset
    // 5-9 year
    // 9-11 month
    // 11-12 day
    // 13-14 type
    // 14-19 strike

    let asset = symbol.substring(0, 5);
    let year = symbol.substring(5, 9);
    let month = symbol.substring(9, 11);
    let day = symbol.substring(11, 12); // fix day should be 2 => dd
    let type = symbol.substring(12, 13);
    let strike = Number(symbol.substring(13, 19)).toString();

    return { asset, year, month, day, type, strike };
};

const mintTestToken = async (signer, tokenAddress, quantity) => {
    const token = new ethers.Contract(tokenAddress, ERC20.abi, signer);
    const account = await signer.getAccount();
    const mintQuantity = parseEther(quantity).toString();
    let tx;
    try {
        tx = await token.mint(account, mintQuantity);
    } catch (err) {
        console.log("Error when minting test token: ", err);
    }

    return tx;
};

export { destructureOptionSymbol, mintTestToken };
