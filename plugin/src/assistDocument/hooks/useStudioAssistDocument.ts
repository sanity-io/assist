import {useEffect, useMemo} from 'react'
import {
  assistDocumentTypeName,
  AssistTasksStatus,
  assistTasksStatusTypeName,
  FieldRef,
  fieldReferenceTypeName,
  InstructionTask,
  StudioAssistDocument,
  StudioAssistField,
  StudioInstruction,
} from '../../types'
import {
  ObjectSchemaType,
  pathToString,
  typed,
  useClient,
  useCurrentUser,
  useValidationStatus,
  ValidationMarker,
} from 'sanity'
import {useDocumentState} from './useDocumentState'
import {assistDocumentId, assistTasksStatusId, publicId} from '../../helpers/ids'
import {maxHistoryVisibilityMs} from '../../constants'

interface UseAssistDocumentProps {
  documentId: string
  schemaType: ObjectSchemaType
}

export function useStudioAssistDocument({
  documentId,
  schemaType,
}: UseAssistDocumentProps): StudioAssistDocument | undefined {
  const documentTypeName = schemaType.name
  const currentUser = useCurrentUser()

  const validation = useValidationStatus(publicId(documentId), schemaType.name).validation
  const assistDocument = useDocumentState<StudioAssistDocument>(
    assistDocumentId(documentTypeName),
    assistDocumentTypeName
  )
  const assistTasksStatus = useDocumentState<AssistTasksStatus>(
    assistTasksStatusId(documentId ?? ''),
    assistTasksStatusTypeName
  )

  const client = useClient({apiVersion: '2023-01-01'})

  useEffect(() => {
    if (!assistDocument) {
      client.createIfNotExists({
        _id: assistDocumentId(documentTypeName),
        _type: assistDocumentTypeName,
      })
    }
  }, [client, assistDocument, documentTypeName])

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
          .map((instruction) => asStudioInstruction(instruction, tasks, validation)),
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
  }, [assistDocument, assistTasksStatus, currentUser, validation])
}

function asStudioInstruction(
  instruction: StudioInstruction,
  run: InstructionTask[],
  validation: ValidationMarker[]
): StudioInstruction {
  const errors = validation.filter((marker) => marker.level === 'error')

  const fieldRefs: FieldRef[] = (instruction?.prompt ?? []).flatMap((block) => {
    if (block._type === 'block') {
      return block.children.filter((c): c is FieldRef => c._type === fieldReferenceTypeName)
    }
    return []
  })

  return {
    ...instruction,
    tasks: run
      .filter((task) => task.instructionKey === instruction._key)
      .filter(
        (task) =>
          task.started &&
          new Date().getTime() - new Date(task.started).getTime() < maxHistoryVisibilityMs
      ),
    validation: errors.filter((marker) =>
      fieldRefs
        .map((r) => r.path)
        .filter((p): p is string => !!p)
        .find((path) => pathToString(marker.path) === path)
    ),
  }
}
