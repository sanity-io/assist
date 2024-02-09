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

export function getDescriptionFieldOption(schemaType: SchemaType | undefined): string | undefined {
  if (!schemaType) {
    return undefined
  }
  const descriptionField = (schemaType.options as ImageOptions)?.aiAssist?.imageDescriptionField
  if (descriptionField) {
    return descriptionField
  }
  return getDescriptionFieldOption(schemaType.type)
}

export function getImageInstructionFieldOption(
  schemaType: SchemaType | undefined
): string | undefined {
  if (!schemaType) {
    return undefined
  }
  const imageInstructionField = (schemaType.options as ImageOptions)?.aiAssist
    ?.imageInstructionField
  if (imageInstructionField) {
    return imageInstructionField
  }
  return getImageInstructionFieldOption(schemaType.type)
}
