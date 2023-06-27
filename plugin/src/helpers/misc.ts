import {documentRootKey, StudioInstruction} from '../types'
import {Path, pathToString} from 'sanity'
import {useMemo} from 'react'

export function usePathKey(path: Path | string) {
  return useMemo(() => {
    if (path.length) {
      return Array.isArray(path) ? pathToString(path) : path
    }
    return documentRootKey
  }, [path])
}

export function getInstructionTitle(instruction?: StudioInstruction) {
  return instruction?.title ?? 'Untitled'
}
