import {useEffect, useMemo} from 'react'
import {type ObjectSchemaType, typed, useClient, useCurrentUser} from 'sanity'

import {maxHistoryVisibilityMs} from '../../constants'
import {assistDocumentId, assistTasksStatusId} from '../../helpers/ids'
import {
  assistDocumentTypeName,
  type AssistTasksStatus,
  assistTasksStatusTypeName,
  type InstructionTask,
  type StudioAssistDocument,
  type StudioAssistField,
  type StudioInstruction,
} from '../../types'
import {useDocumentState} from './useDocumentState'

interface UseAssistDocumentProps {
  documentId: string
  schemaType: ObjectSchemaType
  initDoc?: boolean
}

export function useStudioAssistDocument({
  documentId,
  schemaType,
  initDoc,
}: UseAssistDocumentProps): StudioAssistDocument | undefined {
  const documentTypeName = schemaType.name
  const currentUser = useCurrentUser()

  const assistDocument = useDocumentState<StudioAssistDocument>(
    assistDocumentId(documentTypeName),
    assistDocumentTypeName,
  )
  const assistTasksStatus = useDocumentState<AssistTasksStatus>(
    assistTasksStatusId(documentId ?? ''),
    assistTasksStatusTypeName,
  )

  const client = useClient({apiVersion: '2023-01-01'})

  useEffect(() => {
    if (!assistDocument && initDoc) {
      client
        .createIfNotExists({
          _id: assistDocumentId(documentTypeName),
          _type: assistDocumentTypeName,
        })
        .catch(() => {
          // best effort
        })
    }
  }, [client, assistDocument, documentTypeName, initDoc])

  return useMemo(() => {
    if (!assistDocument) {
      return undefined
    }
    const tasks = assistTasksStatus?.tasks ?? []
    const fields = (assistDocument?.fields ?? []).map((assistField): StudioAssistField => {
      return {
        ...assistField,
        tasks: tasks.filter((task) => task.path === assistField.path),
        instructions: assistField.instructions
          ?.filter((p) => !p.userId || p.userId === currentUser?.id)
          .map((instruction) => asStudioInstruction(instruction, tasks)),
      }
    })
    return typed<StudioAssistDocument>({
      ...assistDocument,
      tasks: tasks?.map((task) => {
        const instruction = fields
          .find((f) => f.path === task.path)
          ?.instructions?.find((i) => i._key === task.instructionKey)
        return {
          ...task,
          instruction,
        }
      }),
      fields: fields,
    })
  }, [assistDocument, assistTasksStatus, currentUser])
}

function asStudioInstruction(
  instruction: StudioInstruction,
  run: InstructionTask[],
): StudioInstruction {
  return {
    ...instruction,
    tasks: run
      .filter((task) => task.instructionKey === instruction._key)
      .filter(
        (task) =>
          task.started &&
          new Date().getTime() - new Date(task.started).getTime() < maxHistoryVisibilityMs,
      ),
  }
}
