import {ObjectSchemaType} from 'sanity'
import {useMemo} from 'react'
import {useAssistDocumentContextValue} from '../assistDocument/hooks/useAssistDocumentContextValue'
import {aiPresence} from './useAssistPresence'
import {documentRootKey, fieldPresenceTypeName} from '../types'
import {Card, Flex} from '@sanity/ui'
import {AiFieldPresence} from './AiFieldPresence'

export function createAssistDocumentPresence(
  documentId: string | undefined,
  schemaType: ObjectSchemaType
) {
  return function AssistDocumentPresenceWrapper() {
    return documentId ? (
      <AssistDocumentPresence documentId={documentId} schemaType={schemaType} />
    ) : null
  }
}

function AssistDocumentPresence(props: {documentId: string; schemaType: ObjectSchemaType}) {
  const {assistDocument} = useAssistDocumentContextValue(
    props.documentId,
    props.schemaType as ObjectSchemaType
  )
  const anyPresence = useMemo(() => {
    const anyPresence = assistDocument?.tasks
      ?.filter((run) => !run.ended && !run.reason)
      ?.flatMap((run) => run.presence ?? [])
      .find((f) => f.started && new Date().getTime() - new Date(f.started).getTime() < 30000)
    if (anyPresence) {
      return aiPresence(anyPresence, [])
    }
    const anyRun = assistDocument?.tasks
      ?.filter((run) => !run.ended && !run.reason)
      ?.find((f) => f.started && new Date().getTime() - new Date(f.started).getTime() < 30000)
    return anyRun
      ? aiPresence(
          {
            started: anyRun.started,
            path: documentRootKey,
            _key: anyRun._key,
            _type: fieldPresenceTypeName,
          },
          []
        )
      : undefined
  }, [assistDocument?.tasks])

  return (
    <Card>
      <Flex flex={1} justify="flex-end">
        <Flex gap={2} align={'center'}>
          {anyPresence && <AiFieldPresence presence={anyPresence} />}
        </Flex>
      </Flex>
    </Card>
  )
}
