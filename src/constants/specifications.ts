export interface SpecificationMetaData {
  description: string
  name: string
  id: string
}

export const NAME_FOR_SPECIFICATION: { [key: string]: string } = {
  deployer: 'Deployed By',
  assets: 'Assets',
  strikes: 'Strikes',
  expiration: 'Expirations',
  exercise: `Exercise Style`,
  settlement: `Settlement Value`,
  mulitplier: 'Mulitplier',
  margin: 'Margin/Collateral',
  fees: 'Fees',
  voting: 'Voting',
  votingPower: 'Voting Power',
}

export const DESCRIPTION_FOR_SPECIFICATION: { [key: string]: string } = {
  deployer:
    'Anyone can use the Primitive Protocol to deploy option smart contracts.',
  assets: 'Underlying / Dai, Dai / Underlying',
  strikes: 'Strikes will often be out-of-the-money on deployment.',
  expiration: 'Fridays at 8:00:00 UTC.',
  exercise: `American options with manual
  exercising and physical settlement. Options must be manually exercised, which requires action on behalf of the user before expiry.`,
  settlement: 'The underlying tokens',
  mulitplier: `There is a 1 multiplier for calls, and a 1 / strikePrice multiplier for puts. `,
  margin: `100%. For each 1 call option, 1 underlying token must be provided as collateral. For each 1 put option, 1 Dai must be provided as collateral.`,
  fees: `No fees are taken from the Primitive protocol. There is a 0.30% fee per swap for using Uniswap.`,
  voting: `New market proposals are submitted on Wednesdays before a series expires on Friday.`,
  votingPower: `Voting power is determined by the balance of LP tokens in the series which expires on the closest Friday.`,
}

export const SPECIFICATIONS: SpecificationMetaData[] = Object.keys(
  NAME_FOR_SPECIFICATION
).map(
  (key): SpecificationMetaData => {
    return {
      name: NAME_FOR_SPECIFICATION[key],
      description: DESCRIPTION_FOR_SPECIFICATION[key],
      id: key,
    }
  }
)
