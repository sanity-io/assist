import {SchemaType} from 'sanity'
import {AssistOptions} from '../schemas/typeDefExtensions'
import {isType} from './typeUtils'

export function isSchemaAssistEnabled(type: SchemaType) {
  return !(type.options as AssistOptions | undefined)?.aiWritingAssistance?.exclude
}

export function isAssistSupported(type: SchemaType, allowReadonlyHidden = false) {
  if (!isSchemaAssistEnabled(type)) {
    return false
  }

  if (isDisabled(type, allowReadonlyHidden)) {
    return false
  }

  if (type.jsonType === 'array') {
    const unsupportedArray = type.of.every((t) => isDisabled(t, allowReadonlyHidden))
    return !unsupportedArray
  }

  if (type.jsonType === 'object') {
    const unsupportedObject = type.fields.every((field) =>
      isDisabled(field.type, allowReadonlyHidden)
    )
    return !unsupportedObject
  }
  return true
}

function isDisabled(type: SchemaType, allowReadonlyHidden: boolean) {
  const readonlyHidden = !!type.readOnly || !!type.hidden
  return (
    !isSchemaAssistEnabled(type) ||
    isUnsupportedType(type) ||
    (!allowReadonlyHidden && readonlyHidden)
  )
}

function isUnsupportedType(type: SchemaType) {
  return (
    type.jsonType === 'number' ||
    type.name === 'sanity.imageCrop' ||
    type.name === 'sanity.imageHotspot' ||
    (isType(type, 'reference') && !type?.options?.aiWritingAssistance?.embeddingsIndex) ||
    isType(type, 'crossDatasetReference') ||
    isType(type, 'slug') ||
    isType(type, 'url') ||
    isType(type, 'date') ||
    isType(type, 'datetime') ||
    isType(type, 'file')
  )
}
