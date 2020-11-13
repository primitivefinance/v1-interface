import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

import error from './error/reducer'
import notifs from './notifs/reducer'
import options from './options/reducer'
import order from './order/reducer'
import positions from './positions/reducer'
import transactions from './transactions/reducer'

const PERSISTED_KEYS: string[] = ['transactions']

const store = configureStore({
  reducer: {
    error,
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
        'error/clearError',
        'error/throwError',
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
