import {extractWithPath} from '@sanity/mutator'
import {
  isDocumentSchemaType,
  isKeySegment,
  type ObjectSchemaType,
  type Path,
  pathToString,
  type SanityDocumentLike,
} from 'sanity'

import type {DocumentMember, TranslationOutput, TranslationOutputsFunction} from './types'

export interface FieldLanguageMap {
  inputLanguageId: string
  inputPath: Path
  outputs: TranslationOutput[]
}

const DEFAULT_MAX_DEPTH = 6
const ABSOLUTE_MAX_DEPTH = 50

export function getDocumentMembersFlat(
  doc: SanityDocumentLike,
  schemaType: ObjectSchemaType,
  maxDepth = DEFAULT_MAX_DEPTH,
) {
  if (!isDocumentSchemaType(schemaType)) {
    console.error(`Schema type is not a document`)
    return []
  }

  return extractPaths(doc, schemaType, [], Math.min(maxDepth, ABSOLUTE_MAX_DEPTH))
}

function extractPaths(
  doc: SanityDocumentLike,
  schemaType: ObjectSchemaType,
  path: Path,
  maxDepth: number,
): DocumentMember[] {
  if (path.length >= maxDepth) {
    return []
  }

  return schemaType.fields.reduce<DocumentMember[]>((acc, field) => {
    const fieldPath = [...path, field.name]
    const fieldSchema = field.type
    const {value} = extractWithPath(pathToString(fieldPath), doc)[0] ?? {}
    if (!value) {
      return acc
    }

    const thisFieldWithPath: DocumentMember = {
      path: fieldPath,
      name: field.name,
      schemaType: fieldSchema,
      value,
    }

    if (fieldSchema.jsonType === 'object') {
      const innerFields = extractPaths(doc, fieldSchema, fieldPath, maxDepth)

      return [...acc, thisFieldWithPath, ...innerFields]
    } else if (
      fieldSchema.jsonType === 'array' &&
      fieldSchema.of.length &&
      fieldSchema.of.some((item) => 'fields' in item) &&
      // no reason to drill into arrays if the item fields will be culled by maxDepth, ie we need 1 extra path headroom
      path.length + 1 < maxDepth
    ) {
      const {value: arrayValue} = extractWithPath(pathToString(fieldPath), doc)[0] ?? {}

      let arrayPaths: DocumentMember[] = []
      if ((arrayValue as any)?.length) {
        for (const item of arrayValue as any[]) {
          const itemPath = [...fieldPath, {_key: item._key}]
          let itemSchema = fieldSchema.of.find((t) => t.name === item._type)
          if (!item._type) {
            itemSchema = fieldSchema.of[0]
            console.warn(
              'Array item is missing _type - using the first defined type in the array.of schema',
              {
                itemPath,
                item,
                itemSchema,
              },
            )
          }
          if (item._key && itemSchema) {
            const innerFields = extractPaths(
              doc,
              itemSchema as ObjectSchemaType,
              itemPath,
              maxDepth,
            )
            const arrayMember = {
              path: itemPath,
              name: item._key,
              schemaType: itemSchema,
              value: item,
            }
            arrayPaths = [...arrayPaths, arrayMember, ...innerFields]
          }
        }
      }

      return [...acc, thisFieldWithPath, ...arrayPaths]
    }

    return [...acc, thisFieldWithPath]
  }, [])
}

/**
 * Default implementation for plugin config `translate.field.translationOutputs`
 *
 * @see FieldTranslationConfig#translationOutputs
 */
export const defaultLanguageOutputs: TranslationOutputsFunction = function (
  member,
  enclosingType,
  translateFromLanguageId,
  translateToLanguageIds,
) {
  if (
    member.schemaType.jsonType === 'object' &&
    member.schemaType.name.startsWith('internationalizedArray')
  ) {
    const pathEnd = member.path.slice(-1)

    const language = isKeySegment(pathEnd[0]) ? pathEnd[0]._key : null
    return language === translateFromLanguageId
      ? translateToLanguageIds.map((translateToId) => ({
          id: translateToId,
          outputPath: [...member.path.slice(0, -1), {_key: translateToId}],
        }))
      : undefined
  }

  if (enclosingType.jsonType === 'object' && enclosingType.name.startsWith('locale')) {
    return translateFromLanguageId === member.name
      ? translateToLanguageIds.map((translateToId) => ({
          id: translateToId,
          outputPath: [...member.path.slice(0, -1), translateToId],
        }))
      : undefined
  }

  return undefined
}

export function getFieldLanguageMap(
  documentSchema: ObjectSchemaType,
  documentMembers: DocumentMember[],
  translateFromLanguageId: string,
  outputLanguageIds: string[],
  langFn: TranslationOutputsFunction,
): FieldLanguageMap[] {
  const translationMaps: FieldLanguageMap[] = []
  for (const member of documentMembers) {
    const parentPath = member.path.slice(0, -1)
    const enclosingType =
      documentMembers.find((m) => pathToString(m.path) === pathToString(parentPath))?.schemaType ??
      documentSchema

    const translations = langFn(
      member,
      enclosingType,
      translateFromLanguageId,
      outputLanguageIds,
    )?.filter((translation) => translation.id !== translateFromLanguageId)

    if (translations) {
      translationMaps.push({
        inputLanguageId: translateFromLanguageId,
        inputPath: member.path,
        outputs: translations,
      })
    }
  }

  return translationMaps
}
