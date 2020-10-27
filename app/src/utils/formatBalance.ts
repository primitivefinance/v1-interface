const formatBalance = (tokenBalance: string | number) => {
  if (typeof tokenBalance === 'number') {
    tokenBalance = tokenBalance.toString()
  }
  return parseFloat(tokenBalance).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default formatBalance
