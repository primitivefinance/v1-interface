// Serialized implementation of LocalStorage hook from https://github.com/NoahZinsmeister/hypertext/blob/master/context.tsx

import { useState, Dispatch, SetStateAction, useEffect} from 'react'
import { LocalStorageKeys } from '../../constants'

export function useLocalStorage<T, S = T>(
  key: LocalStorageKeys,
  defaultValue: T,
  overrideLookup = false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { serialize, deserialize }: { serialize: (toSerialize: T) => S; deserialize: (toDeserialize: S) => T } = {
    serialize: (toSerialize): S => (toSerialize as unknown) as S,
    deserialize: (toDeserialize): T => (toDeserialize as unknown) as T,
  }
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (overrideLookup) {
      return defaultValue
    } else {
      try {
        const item = window.localStorage.getItem(key)
        return item === null ? defaultValue : deserialize(JSON.parse(item)) ?? defaultValue
      } catch {
        return defaultValue
      }
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(serialize(value)))
    } catch {}
  }, [key, serialize, value])

  return [value, setValue]
}