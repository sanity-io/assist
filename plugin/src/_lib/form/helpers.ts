import {isArraySchemaType, isObjectSchemaType, ObjectItem, SchemaType} from 'sanity'

import {randomKey} from '../randomKey'

export function createProtoValue(type: SchemaType): any {
  if (isObjectSchemaType(type)) {
    return type.name === 'object' ? {} : {_type: type.name}
  }
  if (isArraySchemaType(type)) {
    return []
  }
  if (type.jsonType === 'string') {
    return ''
  }
  if (type.jsonType === 'number') {
    return 0
  }
  if (type.jsonType === 'boolean') {
    return false
  }
  return undefined
}

export function createProtoArrayValue<Item extends ObjectItem>(type: SchemaType): Item {
  if (!isObjectSchemaType(type)) {
    throw new Error(
      `Invalid item type: "${type.type}". Default array input can only contain objects (for now)`,
    )
  }

  return {...createProtoValue(type), _key: randomKey(12)} as Item
}
