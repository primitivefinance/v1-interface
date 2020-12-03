import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

import notifs from './notifs/reducer'
import options from './options/reducer'
import order from './order/reducer'
import positions from './positions/reducer'
import transactions from './transactions/reducer'
import swap from './swap/reducer'
import liquidity from './liquidity/reducer'

const PERSISTED_KEYS: string[] = ['transactions']

const store = configureStore({
  reducer: {
    liquidity,
    notifs,
    options,
    order,
    positions,
    swap,
    transactions,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: {
      // Ignore these action types
      ignoredActions: [
        '<root>',
        'liquidity/typeInput',
        'liquidity/clearInput',
        'notifs/clearNotif',
        'nofifs/addNotif',
        'options/updateOptions',
        'order/updateItem',
        'order/removeItem',
        'positions/updatePositions',
        'swap/typeInput',
        'transactions/addTransaction',
        'transactions/clearAllTransactions',
        'transactions/checkedTransaction',
        'transactions/finalizeTransaction',
      ],
    },
  }),
})

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
