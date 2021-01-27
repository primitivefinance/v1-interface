import { Option, SUSHI_FACTORY_ADDRESS, Venue } from '@primitivefi/sdk'
import { FACTORY_ADDRESS } from '@uniswap/sdk'

const getVenue = (option: Option): Venue => {
  return Venue.UNISWAP
}

export default getVenue
