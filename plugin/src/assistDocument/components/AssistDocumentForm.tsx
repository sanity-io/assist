import {Card, Stack, Text} from '@sanity/ui'
import {useContext, useEffect, useMemo, useRef} from 'react'
import {
  FieldError,
  FormCallbacksProvider,
  FormCallbacksValue,
  FormInput,
  insert,
  KeyedSegment,
  MemberFieldError,
  ObjectInputProps,
  ObjectSchemaType,
  PatchEvent,
  Path,
  SchemaType,
  set,
  setIfMissing,
  stringToPath,
  typed,
  useFormCallbacks,
  useSchema,
} from 'sanity'

import {useAiPaneRouter} from '../../assistInspector/helpers'
import {useAiAssistanceConfig} from '../../assistLayout/AiAssistanceConfigContext'
import {
  AssistDocument,
  AssistField,
  assistFieldTypeName,
  AssistInspectorRouteParams,
  documentRootKey,
  fieldPathParam,
  instructionParam,
  StudioInstruction,
} from '../../types'
import {AssistTypeContext} from './AssistTypeContext'
import {BackToInstructionListLink} from './instruction/BackToInstructionsLink'
import {SelectedFieldContextProvider, SelectedFieldContextValue} from './SelectedFieldContext'

const EMPTY_FIELDS: AssistField[] = []

export function AssistDocumentForm(props: ObjectInputProps) {
  if (props.readOnly) {
    return (
      <Card border tone="caution" padding={2}>
        <Text size={1}> You do not have sufficient permissions to manage instructions.</Text>
      </Card>
    )
  }
  return <AssistDocumentFormEditable {...props} />
}
function AssistDocumentFormEditable(props: ObjectInputProps) {
  const {onChange} = props
  const value = props.value as AssistDocument | undefined
  const id = value?._id
  const fields = value?.fields

  const {params, setParams} = useAiPaneRouter()
  const pathKey = params[fieldPathParam]
  const {typePath, documentType: targetDocumentType} = useContext(AssistTypeContext)
  const instruction = params[instructionParam]

  const activeKey = useMemo(() => {
    if (!typePath) {
      return undefined
    }
    return (fields ?? EMPTY_FIELDS).find((f) => f.path === typePath)?._key
  }, [fields, typePath])

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
    [fieldSchema, documentSchema],
  )

  const title = value?.title

  useEffect(() => {
    if (!title && documentSchema && !id?.startsWith('drafts.')) {
      onChange(set(documentSchema.title ?? documentSchema.name, ['title']))
    }
  }, [title, documentSchema, onChange, id])

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
            }) as Record<keyof AssistInspectorRouteParams, string | undefined>,
          )
          onPathOpen([])
        } else {
          setTimeout(() => onPathOpen(path), 0)
        }
      },
    }),
    [formCallbacks, onPathOpen, params, setParams, instruction],
  )

  useEffect(() => {
    if (activePath && !instruction) {
      onPathOpen([])
    }
  }, [activePath, instruction, onPathOpen])

  const fieldError = useMemo(() => {
    const fieldError = props.members.find(
      (m): m is FieldError => m.kind === 'error' && m.fieldName === 'fields',
    )
    if (fieldError) {
      return <MemberFieldError member={fieldError} />
    }
    return undefined
  }, [props.members])

  return (
    <SelectedFieldContextProvider value={context}>
      <Stack space={5}>
        <FieldsInitializer
          key={typePath}
          pathKey={typePath}
          activePath={activePath}
          fields={fields}
          documentSchema={documentSchema}
          onChange={onChange}
        />
        {instruction && <BackToInstructionListLink />}

        {activePath && !fieldError && (
          <FormCallbacksProvider {...newCallbacks}>
            <div style={{lineHeight: '1.25em'}}>
              <FormInput {...props} absolutePath={activePath} />
            </div>
          </FormCallbacksProvider>
        )}

        {fieldError}

        {!activePath && props.renderDefault(props)}
      </Stack>
    </SelectedFieldContextProvider>
  )
}

function useSelectedSchema(
  fieldPath: string | undefined,
  documentSchema: ObjectSchemaType | undefined,
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

function FieldsInitializer({
  pathKey,
  activePath,
  fields,
  documentSchema,
  onChange,
}: {
  pathKey?: string
  activePath?: Path
  fields: AssistField[] | undefined
  documentSchema: ObjectSchemaType | undefined
  onChange: ObjectInputProps['onChange']
}) {
  const {
    config: {__presets: presets},
  } = useAiAssistanceConfig()

  const existingField = fields?.find((f) => f._key === pathKey)
  const documentPresets = !!documentSchema?.name && presets?.[documentSchema?.name]

  const missingPresetInstructions = useMemo(() => {
    if (!documentPresets || !pathKey) {
      return undefined
    }
    const existingInstructions = existingField?.instructions
    const presetField = documentPresets.fields?.find((f) => f.path === pathKey)
    return presetField?.instructions?.filter(
      (i) => !existingInstructions?.some((ei) => ei._key === i._key),
    )
  }, [documentPresets, pathKey, existingField])

  // need this to not fire onChange twice in React strict mode
  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current || !pathKey) {
      return
    }
    if (existingField && !missingPresetInstructions?.length) {
      return
    }

    let event = PatchEvent.from([setIfMissing([], ['fields'])])
    if (!existingField) {
      event = event.append(
        insert(
          [
            typed<AssistField>({
              _key: pathKey,
              _type: assistFieldTypeName,
              path: pathKey,
              instructions: [],
            }),
          ],
          'after',
          ['fields', -1],
        ),
      )
    }

    if (!existingField?.instructions?.length) {
      event = event.append([setIfMissing([], ['fields', {_key: pathKey}, 'instructions'])])
    }

    if (missingPresetInstructions?.length) {
      event = event.append(
        insert(
          missingPresetInstructions.map(
            (preset): StudioInstruction => ({
              ...preset,
              _type: 'sanity.assist.instruction',
              prompt: preset.prompt?.map((p) => ({markDefs: [], ...p})),
            }),
          ),
          'after',
          ['fields', {_key: pathKey}, 'instructions', -1],
        ),
      )
    }
    onChange(event)
    initialized.current = true
  }, [activePath, onChange, pathKey, existingField, missingPresetInstructions])

  return null
}
