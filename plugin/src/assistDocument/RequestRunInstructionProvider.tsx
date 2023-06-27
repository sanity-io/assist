import {useRunInstruction} from '../assistLayout/RunInstructionProvider'
import {useCallback, useEffect, useState} from 'react'
import {ObjectSchemaType, PatchEvent, SanityDocument, unset} from 'sanity'
import {RunInstructionArgs} from '../assistLayout/AssistLayout'
import {publicId} from '../helpers/ids'

export interface DocumentArgs {
  documentOnChange: (event: PatchEvent) => void
  // indicates if the document is a draft or liveEditable currently
  isDocAssistable: boolean
}

export function isDocAssistable(
  documentSchemaType: ObjectSchemaType,
  published?: SanityDocument | null,
  draft?: SanityDocument | null
) {
  return !!(documentSchemaType.liveEdit ? published : draft)
}

export function getAssistableDocId(documentSchemaType: ObjectSchemaType, documentId: string) {
  const baseId = publicId(documentId)
  return documentSchemaType.liveEdit ? baseId : `drafts.${baseId}`
}

export function useRequestRunInstruction(args: DocumentArgs) {
  const {documentOnChange, isDocAssistable} = args

  const {runInstruction, instructionLoading} = useRunInstruction()
  const [queuedTask, setQueuedTask] = useState<RunInstructionArgs | undefined>(undefined)

  useEffect(() => {
    if (queuedTask && isDocAssistable) {
      runInstruction(queuedTask)
      setQueuedTask(undefined)
    }
  }, [queuedTask, isDocAssistable, runInstruction])

  return {
    instructionLoading,
    requestRunInstruction: useCallback(
      (task: RunInstructionArgs) => {
        // make a dummy edit: this will trigger the document/draft to be created
        documentOnChange(PatchEvent.from([unset(['_force_document_creation'])]))
        setQueuedTask(task)
      },
      [setQueuedTask, documentOnChange]
    ),
  }
}
