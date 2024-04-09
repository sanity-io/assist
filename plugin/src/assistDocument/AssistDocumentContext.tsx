import {createContext, useContext} from 'react'
import {DocumentInspector, ObjectSchemaType, PatchEvent} from 'sanity'

import {StudioAssistDocument} from '../types'

export type AssistDocumentContextValue = (
  | {assistDocument: StudioAssistDocument; loading: false}
  | {assistDocument: undefined; loading: true}
) & {
  documentIsNew: boolean
  assistableDocumentId: string
  documentIsAssistable: boolean
  documentId: string
  documentSchemaType: ObjectSchemaType
  openInspector: (inspectorName: string, paneParams?: Record<string, string>) => void
  closeInspector: (inspectorName?: string) => void
  inspector: DocumentInspector | null
  selectedPath?: string
  documentOnChange: (event: PatchEvent) => void
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
