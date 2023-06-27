import {
  assistFieldTypeName,
  AssistInspectorRouteParams,
  AssistDocument,
  documentRootKey,
  fieldPathParam,
  AssistField,
  instructionParam,
} from '../../types'
import {useEffect, useMemo, useRef} from 'react'
import {
  FormCallbacksProvider,
  FormCallbacksValue,
  FormInput,
  insert,
  KeyedSegment,
  ObjectInputProps,
  ObjectSchemaType,
  Path,
  SchemaType,
  set,
  setIfMissing,
  stringToPath,
  typed,
  useFormCallbacks,
  useSchema,
} from 'sanity'
import {BackToInstructionListLink} from './instruction/BackToInstructionsLink'
import {useAiPaneRouter} from '../../assistInspector/helpers'
import {SelectedFieldContextProvider, SelectedFieldContextValue} from './SelectedFieldContext'
import {Stack} from '@sanity/ui'
import {documentTypeFromAiDocumentId} from '../../helpers/ids'

const EMPTY_FIELDS: AssistField[] = []

export function AssistDocumentForm(props: ObjectInputProps) {
  const {onChange} = props
  const value = props.value as AssistDocument | undefined
  const id = value?._id
  const fields = value?.fields

  // need this to not fire onChange twice in React strict mode
  const onChangeCalled = useRef(false)

  const targetDocumentType = useMemo(() => {
    if (!id) {
      return undefined
    }
    return documentTypeFromAiDocumentId(id)
  }, [id])

  const {params, setParams} = useAiPaneRouter()
  const pathKey = params[fieldPathParam]
  const instruction = params[instructionParam]

  const activeKey = useMemo(
    () => (fields ?? EMPTY_FIELDS).find((f) => f.path === pathKey)?._key,
    [fields, pathKey]
  )

  const activePath: Path | undefined = useMemo(() => {
    if (!activeKey) {
      return undefined
    }
    const base = ['fields', {_key: activeKey}]
    return instruction ? [...base, 'instructions', {_key: instruction}] : base
  }, [activeKey, instruction])

  const schema = useSchema()
  const documentSchema: ObjectSchemaType | undefined = useMemo(() => {
    if (!targetDocumentType) {
      return undefined
    }
    return schema.get(targetDocumentType) as ObjectSchemaType
  }, [schema, targetDocumentType])

  const fieldSchema = useSelectedSchema(pathKey, documentSchema)
  const context: SelectedFieldContextValue = useMemo(
    () => ({
      documentSchema,
      fieldSchema: fieldSchema ?? documentSchema,
    }),
    [fieldSchema, documentSchema]
  )

  const title = value?.title

  useEffect(() => {
    if (!title && documentSchema && !id?.startsWith('drafts.')) {
      onChange(set(documentSchema.title ?? documentSchema.name, ['title']))
    }
  }, [title, documentSchema, onChange, id])

  const fieldExists = fields?.some((f) => f._key === pathKey)
  useEffect(() => {
    if (onChangeCalled.current || fieldExists || activePath || !pathKey) {
      return
    }
    onChange([
      setIfMissing([], ['fields']),
      insert(
        [
          typed<AssistField>({
            _key: pathKey,
            _type: assistFieldTypeName,
            path: pathKey,
          }),
        ],
        'after',
        ['fields', -1]
      ),
    ])
    onChangeCalled.current = true
  }, [activePath, onChange, pathKey, fieldExists])

  const {onPathOpen, ...formCallbacks} = useFormCallbacks()

  const newCallbacks: FormCallbacksValue = useMemo(
    () => ({
      ...formCallbacks,
      onPathOpen: (path) => {
        if (!instruction && path.length === 4 && path[2] === 'instructions') {
          setParams(
            typed<AssistInspectorRouteParams>({
              ...params,
              [instructionParam]: (path[3] as KeyedSegment)?._key,
            }) as Record<keyof AssistInspectorRouteParams, string | undefined>
          )
          onPathOpen([])
        } else {
          setTimeout(() => onPathOpen(path), 0)
        }
      },
    }),
    [formCallbacks, onPathOpen, params, setParams, instruction]
  )

  useEffect(() => {
    if (activePath && !instruction) {
      onPathOpen([])
    }
  }, [activePath, instruction, onPathOpen])

  return (
    <SelectedFieldContextProvider value={context}>
      <Stack space={5}>
        {instruction && <BackToInstructionListLink />}

        {activePath && (
          <FormCallbacksProvider {...newCallbacks}>
            <div style={{lineHeight: '1.25em'}}>
              <FormInput {...props} absolutePath={activePath} />
            </div>
          </FormCallbacksProvider>
        )}

        {!activePath && props.renderDefault(props)}
      </Stack>
    </SelectedFieldContextProvider>
  )
}

function useSelectedSchema(
  fieldPath: string | undefined,
  documentSchema: ObjectSchemaType | undefined
): SchemaType | undefined {
  return useMemo(() => {
    if (!fieldPath) {
      return undefined
    }
    if (fieldPath === documentRootKey) {
      return documentSchema
    }

    const path = stringToPath(fieldPath)
    let currentSchema: ObjectSchemaType | undefined = documentSchema
    for (let i = 0; i < path.length; i++) {
      const segment = path[i]
      const field = currentSchema?.fields.find((f) => f.name === segment)
      if (!field) {
        return undefined
      }
      if (i === path.length - 1) {
        return field.type
      }
      if (field.type.jsonType !== 'object') {
        return undefined
      }
      currentSchema = field.type
    }
    return currentSchema
  }, [documentSchema, fieldPath])
}
