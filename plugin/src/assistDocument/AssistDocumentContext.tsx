import {createContext, useContext} from 'react'
import {DocumentInspector, ObjectSchemaType, PatchEvent} from 'sanity'

import {InstructionTask, StudioAssistDocument} from '../types'

export type AssistDocumentContextValue = (
  | {assistDocument: StudioAssistDocument; loading: false}
  | {assistDocument: undefined; loading: true}
) & {
  documentIsNew: boolean
  /**
   * This is the _actual_ id of the current document (ie the document loaded in the pane); it contains draft. versions. prefix ect depending on context
   */
  assistableDocumentId: string
  documentIsAssistable: boolean
  documentSchemaType: ObjectSchemaType
  openInspector: (inspectorName: string, paneParams?: Record<string, string>) => void
  closeInspector: (inspectorName?: string) => void
  inspector: DocumentInspector | null
  selectedPath?: string
  documentOnChange: (event: PatchEvent) => void

  syntheticTasks?: InstructionTask[]
  addSyntheticTask: (syntheticTask: InstructionTask) => void
  removeSyntheticTask: (syntheticTask: InstructionTask) => void
}

export const AssistDocumentContext = createContext<AssistDocumentContextValue | undefined>(
  undefined,
)

export function useAssistDocumentContext(): AssistDocumentContextValue {
  const context = useContext(AssistDocumentContext)
  if (!context) {
    throw new Error('AssistDocumentContext value is missing')
  }
  return context
}
