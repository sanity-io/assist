import {
  ArraySchemaType,
  ImageOptions,
  ObjectSchemaType,
  ReferenceSchemaType,
  Schema,
  SchemaType,
  typed,
} from 'sanity'
import {
  assistSerializedFieldTypeName,
  assistSerializedTypeName,
  SerializedSchemaMember,
  SerializedSchemaType,
  assistSchemaIdPrefix,
} from '../../types'
import {hiddenTypes} from './schemaUtils'
import {isAssistSupported} from '../../helpers/assistSupported'

interface Options {
  leanFormat?: boolean
}

const inlineTypes = ['document', 'object', 'image', 'file']

export function serializeSchema(schema: Schema, options?: Options): SerializedSchemaType[] {
  const list = schema
    .getTypeNames()
    .filter((t) => !(hiddenTypes.includes(t) || t.startsWith('sanity.')))
    .map((t) => schema.get(t))
    .filter((t): t is SchemaType => !!t)
    // because a field can override exclude at the type level, we have to also serialize excluded types
    // so don't do this: .filter((t) => isAssistSupported(t))
    .filter((t) => !t.hidden && !t.readOnly)
    .map((t) => getSchemaStub(t, schema, options))
    .filter((t) => {
      if ('to' in t && t.to && !t.to.length) {
        return false
      }
      if ('of' in t && t.of && !t.of.length) {
        return false
      }
      if ('fields' in t && t.fields && !t.fields.length) {
        return false
      }
      return true
    })
  list.sort((a, b) => (a?.name ?? '').localeCompare(b?.name ?? ''))
  return list
}

function getSchemaStub(
  schemaType: SchemaType,
  schema: Schema,
  options?: Options
): SerializedSchemaType {
  if (!schemaType.type?.name) {
    console.error('Missing type name', schemaType.type)
    throw new Error('Type is missing name!')
  }
  const baseSchema: SerializedSchemaType = {
    // we dont need type or id when we send using POST, so leave these out to save bandwidth
    ...(options?.leanFormat
      ? {}
      : {_id: `${assistSchemaIdPrefix}${schemaType.name}`, _type: assistSerializedTypeName}),
    name: schemaType.name,
    title: schemaType.title,
    type: schemaType.type.name,
    ...getBaseFields(schema, schemaType, schemaType.type.name, options),
  }

  return removeUndef(baseSchema)
}

function getBaseFields(
  schema: Schema,
  type: SchemaType,
  typeName: string,
  options: Options | undefined
) {
  const imagePromptField = (type.options as ImageOptions)?.imagePromptField
  return removeUndef({
    options: imagePromptField
      ? {
          imagePromptField: imagePromptField,
        }
      : undefined,
    values: Array.isArray(type?.options?.list)
      ? type?.options?.list.map((v: string | {value: string; title: string}) =>
          typeof v === 'string' ? v : v.value ?? `${v.title}`
        )
      : undefined,
    of: 'of' in type && typeName === 'array' ? arrayOf(type, schema, options) : undefined,
    to:
      'to' in type && typeName === 'reference'
        ? refToTypeNames(type as ReferenceSchemaType)
        : undefined,
    fields:
      'fields' in type && inlineTypes.includes(typeName)
        ? serializeFields(schema, type, options)
        : undefined,
  })
}

function serializeFields(
  schema: Schema,
  schemaType: ObjectSchemaType,
  options: Options | undefined
) {
  return schemaType.fields
    .filter((f) => !['sanity.imageHotspot', 'sanity.imageCrop'].includes(f.type?.name ?? ''))
    .filter((f) => isAssistSupported(f.type))
    .filter((f) => !f.type.hidden && !f.type.readOnly)
    .map((field) => serializeMember(schema, field.type, field.name, options))
}

function serializeMember(
  schema: Schema,
  type: SchemaType,
  name: string,
  options: Options | undefined
): SerializedSchemaMember {
  const typeNameExists = !!schema.get(type?.name)
  const typeName = typeNameExists ? type.name : type.type?.name ?? ''
  return removeUndef({
    ...(options?.leanFormat ? {} : {_type: assistSerializedFieldTypeName}),
    name: name,
    type: typeName,
    title: type.title,
    ...getBaseFields(schema, type, typeName, options),
  })
}

function arrayOf(
  arrayType: ArraySchemaType,
  schema: Schema,
  options: Options | undefined
): SerializedSchemaMember[] {
  return arrayType.of
    .filter((type) => isAssistSupported(type))
    .map((t) => {
      return serializeMember(schema, t, t.name, options)
    })
}

function refToTypeNames(type: ReferenceSchemaType) {
  return type.to.map((t) => ({
    type: typed<string>(t.name),
  }))
}

function removeUndef<T extends Record<string, any>>(obj: T): T {
  Object.keys(obj).forEach((key) => (obj[key] === undefined ? delete obj[key] : {}))
  return obj
}
