import React from 'react'

export interface TooltipProps {
  children?: React.ReactNode
}
export const Tooltip: React.FC<TooltipProps> = ({children} => {
  return (
    {children}
  )
}