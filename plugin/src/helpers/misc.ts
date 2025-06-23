import {useMemo} from 'react'
import {Path, pathToString} from 'sanity'

import {documentRootKey, StudioInstruction} from '../types'

export function usePathKey(path: Path | string) {
  return useMemo(() => {
    return getPathKey(path)
  }, [path])
}

export function getPathKey(path: Path | string) {
  if (path.length) {
    return Array.isArray(path) ? pathToString(path) : path
  }
  return documentRootKey
}

export function getInstructionTitle(instruction?: StudioInstruction) {
  return instruction?.title ?? 'Untitled'
}

export function isDefined<T>(t: T | undefined | null): t is T {
  return t !== undefined && t !== null
}
