import {useMemo} from 'react'
import {getDraftId, getVersionId, type ObjectSchemaType, useSchema} from 'sanity'
import {useDocumentPane} from 'sanity/structure'

import {useAiPaneRouter} from '../../assistInspector/helpers'
import {fieldPathParam} from '../../types'
import type {AssistDocumentContextValue} from '../AssistDocumentContext'
import {isDocAssistable} from '../RequestRunInstructionProvider'
import {useStudioAssistDocument} from './useStudioAssistDocument'

export function useAssistDocumentContextValue(documentId: string, documentType: string) {
  const schema = useSchema()

  const documentSchemaType = useMemo(() => {
    const schemaType = schema.get(documentType) as ObjectSchemaType | undefined
    if (!schemaType) {
      throw new Error(`Schema type "${documentType}" not found`)
    }
    return schemaType
  }, [documentType, schema])

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

  let assistableDocumentId = version?._id || draft?._id || published?._id
  if (!assistableDocumentId) {
    assistableDocumentId = selectedReleaseId
      ? getVersionId(documentId, selectedReleaseId)
      : documentSchemaType.liveEdit
        ? documentId
        : getDraftId(documentId)
  }

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
  ])

  return value
}
