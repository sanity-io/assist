import {DocumentLayoutProps} from 'sanity'

import {AssistDocumentContextProvider} from './AssistDocumentContextProvider'

export function AssistDocumentLayout(props: DocumentLayoutProps) {
  const {documentId, documentType} = props
  return (
    <AssistDocumentContextProvider documentType={documentType} documentId={documentId}>
      {props.renderDefault(props)}
    </AssistDocumentContextProvider>
  )
}
