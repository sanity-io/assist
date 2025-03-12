import {
  ArraySchemaType,
  ImageOptions,
  isArraySchemaType,
  ObjectSchemaType,
  ReferenceOptions,
  ReferenceSchemaType,
  Schema,
  SchemaType,
  typed,
} from 'sanity'

import {isAssistSupported} from '../../helpers/assistSupported'
import {isType} from '../../helpers/typeUtils'
import {
  assistSchemaIdPrefix,
  assistSerializedFieldTypeName,
  assistSerializedTypeName,
  SerializedSchemaMember,
  SerializedSchemaType,
} from '../../types'
import {hiddenTypes} from './schemaUtils'

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
  options?: Options,
): SerializedSchemaType {
  if (!schemaType.type?.name) {
    // eslint-disable-next-line no-console -- log error
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
  options: Options | undefined,
) {
  const schemaOptions: SerializedSchemaType['options'] = removeUndef({
    imagePromptField: (type.options as ImageOptions)?.aiAssist?.imageInstructionField,
    embeddingsIndex: (type.options as ReferenceOptions)?.aiAssist?.embeddingsIndex,
  })
  return removeUndef({
    options: Object.keys(schemaOptions).length ? schemaOptions : undefined,
    values: Array.isArray(type?.options?.list)
      ? type?.options?.list.map((v: string | {value: string; title: string}) =>
          typeof v === 'string' ? v : (v.value ?? `${v.title}`),
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
    annotations:
      typeName === 'block' && 'fields' in type
        ? serializeAnnotations(type, schema, options)
        : undefined,
    inlineOf:
      typeName === 'block' && 'fields' in type
        ? serializeInlineOf(type, schema, options)
        : undefined,
    hidden:
      typeof type.hidden === 'function' ? ('function' as const) : type.hidden ? true : undefined,
    readOnly:
      typeof type.readOnly === 'function'
        ? ('function' as const)
        : type.readOnly
          ? true
          : undefined,
  })
}

function serializeFields(
  schema: Schema,
  schemaType: ObjectSchemaType,
  options: Options | undefined,
) {
  const fields = schemaType.fieldsets
    ? schemaType.fieldsets.flatMap((fs) =>
        fs.single
          ? fs.field
          : fs.fields.map((f) => ({
              ...f,
              type: {
                ...f.type,
                // if fieldset is (conditionally) hidden, the field must be considered the same way
                // ie, if the field does not show up in conditionalMembers, it is hidden
                // regardless of weather or not it is the field function or the fieldset function that hides it
                hidden:
                  typeof fs.hidden === 'function' ? fs.hidden : fs.hidden ? true : f.type.hidden,
              },
            })),
      )
    : schemaType.fields

  return fields
    .filter((f) => !['sanity.imageHotspot', 'sanity.imageCrop'].includes(f.type?.name ?? ''))
    .filter((f) => isAssistSupported(f.type))
    .map((field) => serializeMember(schema, field.type, field.name, options))
}

function serializeMember(
  schema: Schema,
  type: SchemaType,
  name: string,
  options: Options | undefined,
): SerializedSchemaMember {
  const typeNameExists = !!schema.get(type?.name)
  const typeName = typeNameExists ? type.name : (type.type?.name ?? '')
  return removeUndef({
    ...(options?.leanFormat ? {} : {_type: assistSerializedFieldTypeName}),
    name: name,
    type: typeName,
    title: type.title,
    ...getBaseFields(schema, type, typeName, options),
  })
}

function serializeInlineOf(
  blockSchemaType: ObjectSchemaType,
  schema: Schema,
  options: Options | undefined,
): SerializedSchemaMember[] | undefined {
  const childrenField = blockSchemaType.fields.find((f) => f.name === 'children')
  const childrenType = childrenField?.type
  if (!childrenType || !isArraySchemaType(childrenType)) {
    return undefined
  }
  return arrayOf(
    {
      ...childrenType,
      of: childrenType.of.filter((t) => !isType(t, 'span')),
    },
    schema,
    options,
  )
}

function serializeAnnotations(
  blockSchemaType: ObjectSchemaType,
  schema: Schema,
  options: Options | undefined,
): SerializedSchemaMember[] | undefined {
  const markDefs = blockSchemaType.fields.find((f) => f.name === 'markDefs')
  const marksType = markDefs?.type
  if (!marksType || !isArraySchemaType(marksType)) {
    return undefined
  }
  return arrayOf(marksType, schema, options)
}

function arrayOf(
  arrayType: ArraySchemaType,
  schema: Schema,
  options: Options | undefined,
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
