'use strict'

const { makeEthersBase } = require('ethers-base');
const mapValues = require('lodash/mapValues');

const rinkeby = {
  ETH: require('@primitivefi/contracts/deployments/rinkeby/ETH'),
  Factory: require('@primitivefi/contracts/deployments/rinkeby/Factory'),
  FactoryRedeem: require('@primitivefi/contracts/deployments/rinkeby/FactoryRedeem'),
  OptionFactory: require('@primitivefi/contracts/deployments/rinkeby/OptionFactory'),
  OptionTemplateLib: require('@primitivefi/contracts/deployments/rinkeby/OptionTemplateLib'),
  PrimeTrader: require('@primitivefi/contracts/deployments/rinkeby/PrimeTrader'),
  RedeemFactory: require('@primitivefi/contracts/deployments/rinkeby/RedeemFactory'),
  RedeemTemplateLib: require('@primitivefi/contracts/deployments/rinkeby/RedeemTemplateLib'),
  Registry: require('@primitivefi/contracts/deployments/rinkeby/Registry'),
  TestERC20: require('@primitivefi/contracts/deployments/rinkeby/TestERC20'),
  Trader: require('@primitivefi/contracts/deployments/rinkeby/Trader'),
  USDC: require('@primitivefi/contracts/deployments/rinkeby/USDC'),
  UniswapConnector02: require('@primitivefi/contracts/deployments/rinkeby/UniswapConnector02'),
  UniswapTrader: require('@primitivefi/contracts/deployments/rinkeby/UniswapTrader'),
  WETH9: require('@primitivefi/contracts/deployments/rinkeby/WETH9'),
  WethConnector01: require('@primitivefi/contracts/deployments/rinkeby/WethConnector01')
};
// only rinkeby is up to date .. so we just construct those base classes
Object.assign(module.exports, mapValues(rinkeby, (v) => {
  const networks = {
    '4': {
      address: v.address
    }
  };
  return class extends makeEthersBase(v) {
    static get networks() {
      return networks;
    }
  };
}));
