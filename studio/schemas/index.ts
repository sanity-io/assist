import * as allSchemas from './allSchemas'

export const schemaTypes = Object.values({...allSchemas})
  .map((m: any) => {
    // adds support for import * as someFeature from '../feature/all-feature-schemas'
    if (!m.type) {
      return Object.values(m)
    }
    return m
  })
  .flatMap((type: any) => type)
  .filter((type: any) => type && type.type && type.name)
