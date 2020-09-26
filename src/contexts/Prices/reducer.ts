import { PricesData, PricesState, AssetsData } from './types'

export const SET_PRICES = 'SET_PRICES'
export const SET_ASSETS = 'SET_ASSETS'

export interface SetPricesAction {
  type: typeof SET_PRICES
  prices: PricesData
}

export interface SetAssetsAction {
  type: typeof SET_ASSETS
  assets: AssetsData
}

export type PricesActions = SetPricesAction | SetAssetsAction
export const initialState: PricesState = {
  prices: {},
  assets: {},
}

export const setPrices = (pricesData: PricesData): SetPricesAction => {
  return {
    type: SET_PRICES,
    prices: pricesData,
  }
}

export const setAssets = (assetsData: AssetsData): SetAssetsAction => {
  return {
    type: SET_ASSETS,
    assets: assetsData,
  }
}

const reducer = (state: PricesState, action: PricesActions) => {
  switch (action.type) {
    case SET_PRICES:
      return {
        ...state,
        prices: {
          ...state.prices,
          ...action.prices,
        },
      }
    case SET_ASSETS:
      return {
        ...state,
        assets: {
          ...state.assets,
          ...action.assets,
        },
      }
    default:
      return state
  }
}

export default reducer
