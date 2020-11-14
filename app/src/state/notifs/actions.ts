import { createAction } from '@reduxjs/toolkit'

export const addNotif = createAction<{
  id: number // 0 = errors, 1 = trade notifications, 2 = market alerts
  title: string
  msg: string
  link: string
}>('notifs/addNotif')

export const clearNotif = createAction<number>('notifs/clearNotif')
