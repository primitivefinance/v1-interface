const formatBalance = (tokenBalance: string) => {
  return parseFloat(tokenBalance).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default formatBalance
