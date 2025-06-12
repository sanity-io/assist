import {Card, Flex} from '@sanity/ui'
import {useMemo} from 'react'

import {useAssistDocumentContext} from '../assistDocument/AssistDocumentContext'
import {documentRootKey, fieldPresenceTypeName} from '../types'
import {AiFieldPresence} from './AiFieldPresence'
import {aiPresence} from './useAssistPresence'

export function createAssistDocumentPresence(documentId: string | undefined) {
  return function AssistDocumentPresenceWrapper() {
    return documentId ? <AssistDocumentPresence /> : null
  }
}

function AssistDocumentPresence() {
  const {assistDocument, syntheticTasks} = useAssistDocumentContext()
  const anyPresence = useMemo(() => {
    const anyPresence = [...(assistDocument?.tasks ?? []), ...(syntheticTasks ?? [])]
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
          [],
        )
      : undefined
  }, [assistDocument?.tasks, syntheticTasks])

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
