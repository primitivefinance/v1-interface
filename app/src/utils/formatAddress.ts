const formatAddress = (address: string) => {
  return address.slice(0, 5) + '...' + address.slice(-5)
}

export default formatAddress
