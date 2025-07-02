import {ReferenceOptions, SchemaType} from 'sanity'

import {AssistOptions} from '../schemas/typeDefExtensions'
import {isType} from './typeUtils'

export function isSchemaAssistEnabled(type: SchemaType) {
  return !(type.options as AssistOptions | undefined)?.aiAssist?.exclude
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
    return (
      !unsupportedObject ||
      /* to allow attaching custom actions on fieldless images */
      isType(type, 'image')
    )
  }
  return true
}

function isDisabled(type: SchemaType) {
  return !isSchemaAssistEnabled(type) || isUnsupportedType(type)
}

function isUnsupportedType(type: SchemaType) {
  return (
    type.name === 'sanity.imageCrop' ||
    type.name === 'sanity.imageHotspot' ||
    isType(type, 'globalDocumentReference') ||
    (isType(type, 'reference') &&
      !(type?.options as ReferenceOptions)?.aiAssist?.embeddingsIndex) ||
    isType(type, 'crossDatasetReference') ||
    isType(type, 'file')
  )
}
