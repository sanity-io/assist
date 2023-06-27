import {ArraySchemaType, SchemaType} from 'sanity'

export function isPortableTextArray(type: ArraySchemaType) {
  return type.of.find((t) => isType(t, 'block'))
}

export function isType(schemaType: SchemaType, typeName: string): boolean {
  if (schemaType.name === typeName) {
    return true
  }
  if (!schemaType.type) {
    return false
  }
  return isType(schemaType.type, typeName)
}
