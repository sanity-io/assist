import {ArraySchemaType, ImageOptions, SchemaType} from 'sanity'

export function isPortableTextArray(type: ArraySchemaType) {
  return type.of.find((t) => isType(t, 'block'))
}

/**
 * Returns true if the `schemaType` or any of its parent types (`schemaType.type`)` has `name` equal
 * to `typeName`.
 *
 * Useful for checking if `schemaType` is a type alias of `ìmage`, `code` or similar.
 */
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

export function getDescriptionFieldOption(
  schemaType: SchemaType | undefined,
): {path: string; updateOnImageChange: boolean} | undefined {
  if (!schemaType) {
    return undefined
  }
  const descriptionField = (schemaType.options as ImageOptions)?.aiAssist?.imageDescriptionField
  if (typeof descriptionField === 'string') {
    return {
      path: descriptionField,
      updateOnImageChange: true,
    }
  } else if (descriptionField) {
    return {
      path: descriptionField.path,
      updateOnImageChange: descriptionField.updateOnImageChange ?? true,
    }
  }
  return getDescriptionFieldOption(schemaType.type)
}

export function getImageInstructionFieldOption(
  schemaType: SchemaType | undefined,
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
