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

  if (isUnsupportedType(type)) {
    return false
  }

  if (type.jsonType === 'array') {
    const unsupportedArray = type.of.every((t) => isUnsupportedType(t))
    return !unsupportedArray
  }

  if (type.jsonType === 'object') {
    const unsupportedObject = type.fields.every((field) => isUnsupportedType(field.type))
    return !unsupportedObject
  }
  return true
}

function isUnsupportedType(type: SchemaType) {
  return (
    !isSchemaAssistEnabled(type) ||
    type.jsonType === 'number' ||
    type.name === 'sanity.imageCrop' ||
    type.name === 'sanity.imageHotspot' ||
    isType(type, 'reference') ||
    isType(type, 'crossDatasetReference') ||
    isType(type, 'slug') ||
    isType(type, 'url') ||
    isType(type, 'date') ||
    isType(type, 'datetime') ||
    isType(type, 'file')
  )
}
