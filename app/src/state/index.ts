import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

import notifs from './notifs/reducer'
import options from './options/reducer'
import order from './order/reducer'
import positions from './positions/reducer'
import transactions from './transactions/reducer'

const PERSISTED_KEYS: string[] = ['transactions']

const store = configureStore({
  reducer: {
    notifs,
    options,
    order,
    positions,
    transactions,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: {
      // Ignore these action types
      ignoredActions: [
        '<root>',
        'notifs/clearNotif',
        'nofifs/addNotif',
        'options/updateOptions',
        'order/updateItem',
        'order/removeItem',
        'positions/updatePositions',
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
