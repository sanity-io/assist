import {PropsWithChildren} from 'react'

import {AssistDocumentContext} from './AssistDocumentContext'
import {useAssistDocumentContextValue} from './hooks/useAssistDocumentContextValue'

export interface AIDocumentInputProps {
  documentId: string
  documentType: string
}

export function AssistDocumentContextProvider(props: PropsWithChildren<AIDocumentInputProps>) {
  const {documentId, documentType} = props
  const value = useAssistDocumentContextValue(documentId, documentType)
  return (
    <AssistDocumentContext.Provider value={value}>{props.children}</AssistDocumentContext.Provider>
  )
}
