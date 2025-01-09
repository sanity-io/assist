import {useCallback, useEffect, useState} from 'react'
import {ObjectSchemaType, PatchEvent, SanityDocument, unset} from 'sanity'

import {useRunInstruction} from '../assistLayout/RunInstructionProvider'

export interface DraftDelayedTaskArgs<T> {
  documentOnChange: (event: PatchEvent) => void
  // indicates if the document is a draft or liveEditable currently
  isDocAssistable: boolean
  task: (args: T) => void
}

export function isDocAssistable(
  documentSchemaType: ObjectSchemaType,
  published?: SanityDocument | null,
  draft?: SanityDocument | null,
) {
  return !!(documentSchemaType.liveEdit ? published : draft)
}

export function useRequestRunInstruction(args: {
  documentOnChange: (event: PatchEvent) => void
  // indicates if the document is a draft or liveEditable currently
  isDocAssistable: boolean
}) {
  const {runInstruction, instructionLoading} = useRunInstruction()
  const requestRunInstruction = useDraftDelayedTask({
    ...args,
    task: runInstruction,
  })

  return {
    instructionLoading,
    requestRunInstruction,
  }
}

/**
 * Ensures that the current document is a draft before running task
 */
export function useDraftDelayedTask<T>(args: DraftDelayedTaskArgs<T>) {
  const {documentOnChange, isDocAssistable, task} = args

  const [queuedArgs, setQueuedArgs] = useState<T | undefined>(undefined)

  useEffect(() => {
    if (queuedArgs && isDocAssistable) {
      task(queuedArgs)
      setQueuedArgs(undefined)
    }
  }, [queuedArgs, isDocAssistable, task])

  return useCallback(
    (taskArgs: T) => {
      // make a dummy edit: this will trigger the document/draft to be created
      documentOnChange(PatchEvent.from([unset(['_force_document_creation'])]))
      setQueuedArgs(taskArgs)
    },
    [setQueuedArgs, documentOnChange],
  )
}
