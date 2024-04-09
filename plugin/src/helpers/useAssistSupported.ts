import {useMemo} from 'react'
import {Path, SchemaType} from 'sanity'

import {isAssistSupported} from './assistSupported'

export function useAssistSupported(path: Path, schemaType: SchemaType) {
  return useMemo(() => isAssistSupported(schemaType), [schemaType])
}
