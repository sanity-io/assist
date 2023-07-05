import {
  BlockContentIcon,
  BlockquoteIcon,
  DocumentIcon,
  ImageIcon,
  LinkIcon,
  OlistIcon,
  StringIcon,
} from '@sanity/icons'
import {isObjectSchemaType, ObjectSchemaType, Path, pathToString, SchemaType} from 'sanity'
import {ComponentType, useContext, useMemo} from 'react'
import {AssistInspectorRouteParams, documentRootKey, fieldPathParam} from '../types'
import {usePaneRouter} from 'sanity/desk'
import {isAssistSupported} from '../helpers/assistSupported'
import {isPortableTextArray, isType} from '../helpers/typeUtils'
import {SelectedFieldContext} from '../assistDocument/components/SelectedFieldContext'

export interface FieldRef {
  key: string
  path: Path
  title: string
  schemaType: SchemaType
  icon: ComponentType
}

const maxDepth = 4

export function getTypeIcon(schemaType: SchemaType) {
  let t: SchemaType | undefined = schemaType

  while (t) {
    if (t.icon) return t.icon
    t = t.type
  }

  if (isType(schemaType, 'slug')) return LinkIcon
  if (isType(schemaType, 'image')) return ImageIcon
  if (schemaType.jsonType === 'array' && isPortableTextArray(schemaType)) return BlockContentIcon

  if (schemaType.jsonType === 'array') return OlistIcon
  if (schemaType.jsonType === 'object') return BlockquoteIcon
  if (schemaType.jsonType === 'string') return StringIcon

  return DocumentIcon
}

export function getFieldRefsWithDocument(schemaType: ObjectSchemaType): FieldRef[] {
  const fields = getFieldRefs(schemaType)
  return [
    {
      key: documentRootKey,
      icon: schemaType.icon ?? DocumentIcon,
      title: `The entire document`,
      path: [],
      schemaType: schemaType,
    },

    ...fields,
  ]
}

export function getFieldRefs(
  schemaType: ObjectSchemaType,
  parent?: FieldRef,
  depth = 0
): FieldRef[] {
  if (depth >= maxDepth) {
    return []
  }
  return schemaType.fields
    .filter((f) => !f.name.startsWith('_'))
    .flatMap((field) => {
      const path: Path = parent ? [...parent.path, field.name] : [field.name]
      const title = field.type.title ?? field.name
      const fieldRef: FieldRef = {
        key: pathToString(path),
        path,
        title: parent ? [parent.title, title].join(' / ') : title,
        schemaType: field.type,
        icon: getTypeIcon(field.type),
      }
      const fields =
        field.type.jsonType === 'object' ? getFieldRefs(field.type, fieldRef, depth + 1) : []

      if (!isAssistSupported(field.type)) {
        return fields
      }
      return [fieldRef, ...fields]
    })
}

export function useSelectedField(
  documentSchemaType?: SchemaType,
  path?: string
): FieldRef | undefined {
  const selectableFields = useMemo(
    () =>
      documentSchemaType && isObjectSchemaType(documentSchemaType)
        ? getFieldRefsWithDocument(documentSchemaType)
        : [],
    [documentSchemaType]
  )

  return useMemo(() => {
    return path ? selectableFields?.find((f) => f.key === path) : undefined
  }, [selectableFields, path])
}

export function useSelectedFieldTitle() {
  const {params} = useAiPaneRouter()
  const {documentSchema} = useContext(SelectedFieldContext) ?? {}
  const selectedField = useSelectedField(documentSchema, params[fieldPathParam])
  return getFieldTitle(selectedField)
}

export function getFieldTitle(field?: FieldRef) {
  const schemaType = field?.schemaType
  return schemaType?.title ?? schemaType?.name ?? 'Untitled'
}

export function useAiPaneRouter() {
  const paneRouter = usePaneRouter()

  return useMemo(
    () =>
      ({...paneRouter, params: paneRouter.params ?? {}} as Omit<
        typeof paneRouter,
        'setParams' | 'params'
      > & {
        params: AssistInspectorRouteParams
        setParams: (p: Record<keyof AssistInspectorRouteParams, string | undefined>) => void
      }),
    [paneRouter]
  )
}
