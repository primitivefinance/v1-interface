import React, { useState, useRef, useEffect, useCallback } from 'react'

export const useClickAway = (onClickAway: (e: MouseEvent) => void) => {
  const [node, setNode] = useState<Element | null>(null)

  const nodeRef = useCallback((node: any) => {
    setNode(node)
  }, [])

  useEffect(() => {
    if (!node) return

    const onClick = (event: MouseEvent) => {
      if (!node.contains(event.target as Element)) {
        onClickAway(event)
      }
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
    }
  }, [node, onClickAway])

  return nodeRef
}
