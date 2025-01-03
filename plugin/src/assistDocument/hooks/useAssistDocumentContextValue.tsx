import {useMemo} from 'react'
import {getPublishedId, type ObjectSchemaType, useEditState} from 'sanity'
import {useDocumentPane} from 'sanity/structure'

import {useAiPaneRouter} from '../../assistInspector/helpers'
import {fieldPathParam} from '../../types'
import type {AssistDocumentContextValue} from '../AssistDocumentContext'
import {isDocAssistable} from '../RequestRunInstructionProvider'
import {useStudioAssistDocument} from './useStudioAssistDocument'

export function useAssistDocumentContextValue(
  documentId: string,
  documentSchemaType: ObjectSchemaType,
) {
  const {
    openInspector,
    closeInspector,
    inspector,
    onChange: documentOnChange,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore this is a valid option available in `corel` - Remove after corel is merged to next
    selectedReleaseId,
  } = useDocumentPane()

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore this is a valid option available in `corel` - Remove after corel is merged to next
  const {published, draft, version} = useEditState(
    getPublishedId(documentId),
    documentSchemaType.name,
    'low',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore this is a valid option available in `corel` - Remove after corel is merged to next
    selectedReleaseId,
  )

  const assistableDocumentId = version?._id || draft?._id || published?._id || documentId
  const documentIsNew = selectedReleaseId ? !version?._id : !draft?._id && !published?._id
  const documentIsAssistable = selectedReleaseId
    ? Boolean(version)
    : isDocAssistable(documentSchemaType, published, draft)

  const {params} = useAiPaneRouter()
  const selectedPath = params[fieldPathParam]

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
