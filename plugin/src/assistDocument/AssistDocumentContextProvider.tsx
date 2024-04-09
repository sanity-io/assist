import {PropsWithChildren} from 'react'
import {ObjectSchemaType} from 'sanity'

import {AssistDocumentContext} from './AssistDocumentContext'
import {useAssistDocumentContextValue} from './hooks/useAssistDocumentContextValue'

export interface AIDocumentInputProps {
  documentId: string
  schemaType: ObjectSchemaType
}

export function AssistDocumentContextProvider(props: PropsWithChildren<AIDocumentInputProps>) {
  const {documentId, schemaType} = props
  const value = useAssistDocumentContextValue(documentId, schemaType)
  return (
    <AssistDocumentContext.Provider value={value}>{props.children}</AssistDocumentContext.Provider>
  )
}
