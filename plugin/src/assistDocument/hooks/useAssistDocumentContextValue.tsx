import {useCallback, useEffect, useMemo, useState} from 'react'
import {getDraftId, getVersionId, type ObjectSchemaType, useSchema} from 'sanity'
import {useDocumentPane} from 'sanity/structure'
import {fieldPathParam, InstructionTask} from '../../types'
import {AssistDocumentContextValue} from '../AssistDocumentContext'
import {isDocAssistable} from '../RequestRunInstructionProvider'
import {useStudioAssistDocument} from './useStudioAssistDocument'
import {useAiAssistanceConfig} from '../../assistLayout/AiAssistanceConfigContext'
import {useAiPaneRouter} from '../../assistInspector/helpers'

export function useAssistDocumentContextValue(documentId: string, documentType: string) {
  const schema = useSchema()

  const {getFieldRefs, getFieldRefsByTypePath} = useAiAssistanceConfig()
  const documentSchemaType = useMemo(() => {
    const schemaType = schema.get(documentType) as ObjectSchemaType | undefined
    if (!schemaType) {
      throw new Error(`Schema type "${documentType}" not found`)
    }
    return schemaType
  }, [documentType, schema])

  const {fieldRefs, fieldRefsByTypePath} = useMemo(() => {
    return {
      fieldRefs: getFieldRefs(documentType),
      fieldRefsByTypePath: getFieldRefsByTypePath(documentType),
    }
  }, [getFieldRefs, getFieldRefsByTypePath, documentType])

  const {
    openInspector,
    closeInspector,
    inspector,
    onChange: documentOnChange,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore this is a valid option available in `corel` - Remove after corel is merged to next
    selectedReleaseId,
    editState,
  } = useDocumentPane()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore this is a valid option available in `corel` - Remove after corel is merged to next
  const {draft, published, version} = editState || {}

  const assistableDocumentId = selectedReleaseId
    ? getVersionId(documentId, selectedReleaseId)
    : documentSchemaType.liveEdit
      ? documentId
      : getDraftId(documentId)

  const documentIsNew = selectedReleaseId ? !version?._id : !draft?._id && !published?._id
  const documentIsAssistable = selectedReleaseId
    ? !!version
    : isDocAssistable(documentSchemaType, published, draft)

  const {params} = useAiPaneRouter()
  const selectedPath = params[fieldPathParam]

  const assistDocument = useStudioAssistDocument({
    documentId: assistableDocumentId,
    schemaType: documentSchemaType,
  })
  const {syntheticTasks, addSyntheticTask, removeSyntheticTask} =
    useSyntheticTasks(assistableDocumentId)

  const value: AssistDocumentContextValue = useMemo(() => {
    const base = {
      assistableDocumentId,
      documentSchemaType,
      documentIsNew,
      documentIsAssistable,
      openInspector,
      closeInspector,
      inspector,
      documentOnChange,
      selectedPath,
      syntheticTasks,
      addSyntheticTask,
      removeSyntheticTask,
      fieldRefs,
      fieldRefsByTypePath,
    }
    if (!assistDocument) {
      return {...base, loading: true, assistDocument: undefined}
    }
    return {
      ...base,
      loading: false,
      assistDocument: assistDocument,
    }
  }, [
    assistDocument,
    documentIsAssistable,
    assistableDocumentId,
    documentSchemaType,
    documentIsNew,
    openInspector,
    closeInspector,
    inspector,
    documentOnChange,
    selectedPath,
    syntheticTasks,
    addSyntheticTask,
    removeSyntheticTask,
    fieldRefs,
    fieldRefsByTypePath,
  ])

  return value
}

function useSyntheticTasks(assistableDocumentId: string) {
  const [syntheticTasks, setSyntheticTasks] = useState<InstructionTask[]>(() => [])
  const addSyntheticTask = useCallback((task: InstructionTask) => {
    setSyntheticTasks((current) => [...current, task])
  }, [])
  const removeSyntheticTask = useCallback((task: InstructionTask) => {
    setSyntheticTasks((current) => current.filter((t) => task._key !== t._key))
  }, [])

  useEffect(() => {
    setSyntheticTasks([])
  }, [assistableDocumentId])

  return {
    syntheticTasks,
    addSyntheticTask,
    removeSyntheticTask,
  }
}
