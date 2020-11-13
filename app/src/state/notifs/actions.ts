import { createAction } from '@reduxjs/toolkit'

export const addNotif = createAction<{
  id: number // 0 = trade notifications
  title: string
  message: string
  link: string
}>('notifs/addNotif')

export const clearNotif = createAction<number>('notifs/clearNotif')
