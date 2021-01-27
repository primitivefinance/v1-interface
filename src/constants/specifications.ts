export interface SpecificationMetaData {
  description: string
  name: string
  id: string
}

export const NAME_FOR_SPECIFICATION: { [key: string]: string } = {
  deployer: 'Who deploys options?',
  assets: 'What assets are supported by Primitive?',
  strikes: 'How are strikes determined?',
  expiration: 'When do options expire?',
  exercise: `What type of options does Primitive support?`,
  settlement: `How are options settled?`,
  mulitplier: 'Is there an option contract multiplier?',
  margin: 'Is margin available?',
  fees: 'What is the fee structure?',
  voting: 'How can I propose new option markets?',
  votingPower: 'How do I vote on new option markets?',
}

export const DESCRIPTION_FOR_SPECIFICATION: { [key: string]: string } = {
  deployer:
    'Anyone can use the Registry contract to deploy new options, but only protocol-endorsed option markets are tradeable from this interface.',
  assets:
    'We support an ever-expanding list of underlying assets, and currently use DAI as the strike asset.',
  strikes:
    'Although governance controls the release of new options, option strikes are usually out-of-the-money upon deployment.',
  expiration:
    'Governance currently prefers to deploy new options with a expiration of Friday at 8:00:00 UTC.',
  exercise: `American options with manual exercising and physical settlement. Options must be manually exercised, which requires action on behalf of the user before expiry.`,
  settlement:
    'Call options are settled in the underlying asset.  Put options are settled in the strike asset.',
  mulitplier: `There is a 1 multiplier for calls, and a (1 / strike price) multiplier for puts.`,
  margin: `No.  For each 1 call option, 1 underlying token must be provided as collateral. For each 1 put option, 1 DAI must be provided as collateral.`,
  fees: `No fees are taken from the Primitive Protocol. There is a 0.30% fee per swap for using Uniswap.`,
  voting: `New market proposals are submitted via Snapshot on Wednesdays before a series expires on Friday.`,
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
