const formatAddress = (address: string): string => {
  return address.slice(0, 5) + '...'
}

export default formatAddress
