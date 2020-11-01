'use strict';

const sdk = require('../sdk');
const { expect } = require('chai');
const ethers = require('ethers');

describe('@primitive/interface/sdk', () => {
  it('should tell me that Alex owns it', async () => {
    const factory = sdk.Factory.get('rinkeby');
    expect(await factory.owner()).to.not.eql(ethers.constants.AddressZero);
  })
})
