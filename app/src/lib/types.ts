import ethers from 'ethers'

export interface TradeSettings {
  slippage: string
  timeLimit: number
  receiver: string
  deadline: number
  stablecoin?: string
}

export interface SinglePositionParameters {
  contract: ethers.Contract
  methodName: string
  args: (string | string[])[]
  value: string
  contractsToApprove?: string[]
  tokensToApprove?: string[]
}
