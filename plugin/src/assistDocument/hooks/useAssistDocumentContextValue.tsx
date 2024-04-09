import {useMemo} from 'react'
import {getPublishedId, ObjectSchemaType, useEditState} from 'sanity'
import {useDocumentPane} from 'sanity/desk'

import {useAiPaneRouter} from '../../assistInspector/helpers'
import {fieldPathParam} from '../../types'
import {AssistDocumentContextValue} from '../AssistDocumentContext'
import {isDocAssistable} from '../RequestRunInstructionProvider'
import {useStudioAssistDocument} from './useStudioAssistDocument'

export function useAssistDocumentContextValue(
  documentId: string,
  documentSchemaType: ObjectSchemaType,
) {
  const {published, draft} = useEditState(
    getPublishedId(documentId),
    documentSchemaType.name,
    'low',
  )
  const assistableDocumentId = draft?._id || published?._id || documentId
  const documentIsNew = Boolean(!draft?._id && !published?._id)
  const documentIsAssistable = isDocAssistable(documentSchemaType, published, draft)

  const {params} = useAiPaneRouter()
  const selectedPath = params[fieldPathParam]
  const {openInspector, closeInspector, inspector, onChange: documentOnChange} = useDocumentPane()

  const assistDocument = useStudioAssistDocument({
    documentId,
    schemaType: documentSchemaType,
  })

  const value: AssistDocumentContextValue = useMemo(() => {
    const base = {
      documentId,
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
    documentId,
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
