import {ArraySchemaType, ImageOptions, SchemaType} from 'sanity'

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

export function isImage(schemaType: SchemaType) {
  return isType(schemaType, 'image')
}

export function getCaptionFieldOption(schemaType: SchemaType | undefined): string | undefined {
  if (!schemaType) {
    return undefined
  }
  const captionField = (schemaType.options as ImageOptions)?.captionField
  if (captionField) {
    return captionField
  }
  return getCaptionFieldOption(schemaType.type)
}

export function getImagePromptFieldOption(schemaType: SchemaType | undefined): string | undefined {
  if (!schemaType) {
    return undefined
  }
  const imagePromptField = (schemaType.options as ImageOptions)?.imagePromptField
  if (imagePromptField) {
    return imagePromptField
  }
  return getImagePromptFieldOption(schemaType.type)
}
