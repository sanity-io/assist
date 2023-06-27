import {Path, SchemaType} from 'sanity'
import {useMemo} from 'react'
import {isAssistSupported} from './assistSupported'

export function useAssistSupported(path: Path, schemaType: SchemaType) {
  return useMemo(
    () => path.every((p) => typeof p === 'string') && isAssistSupported(schemaType),
    [path, schemaType]
  )
}
