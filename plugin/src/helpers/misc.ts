import {documentRootKey, StudioInstruction} from '../types'
import {Path, pathToString} from 'sanity'
import {useMemo} from 'react'

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
