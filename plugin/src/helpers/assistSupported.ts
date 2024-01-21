import {SchemaType} from 'sanity'
import {AssistOptions} from '../schemas/typeDefExtensions'
import {isType} from './typeUtils'

export function isSchemaAssistEnabled(type: SchemaType) {
  return !(type.options as AssistOptions | undefined)?.aiWritingAssistance?.exclude
}

export function isAssistSupported(type: SchemaType) {
  if (!isSchemaAssistEnabled(type)) {
    return false
  }

  if (isDisabled(type)) {
    return false
  }

  if (type.jsonType === 'array') {
    const unsupportedArray = type.of.every((t) => isDisabled(t))
    return !unsupportedArray
  }

  if (type.jsonType === 'object') {
    const unsupportedObject = type.fields.every((field) => isDisabled(field.type))
    return !unsupportedObject
  }
  return true
}

function isDisabled(type: SchemaType) {
  return !isSchemaAssistEnabled(type) || isUnsupportedType(type)
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
