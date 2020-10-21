'use strict'

Object.assign(module.exports, {
  Redeem: require('./src/redeem'),
  Option: require('./src/option'),
  Trader: require('./src/trader'),
  Registry: require('./src/registry'),
  Token: require('./src/token'),
  UniswapFactory: require('./src/uniswapFactory'),
  UniswapPair: require('./src/uniswapPair'),
  UniswapRouter: require('./src/uniswapRouter'),
  utils: require('./src/utils'),
})
