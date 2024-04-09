import {useToast} from '@sanity/ui'
import {addSeconds, isAfter} from 'date-fns'
import {useEffect, useRef} from 'react'
import {ObjectSchemaType, useCurrentUser} from 'sanity'

import {getInstructionTitle} from '../../helpers/misc'
import {InstructionTask} from '../../types'
import {useStudioAssistDocument} from './useStudioAssistDocument'

const NO_TASKS: InstructionTask[] = []

export function useInstructionToaster(documentId: string, documentSchemaType: ObjectSchemaType) {
  const assistDocument = useStudioAssistDocument({documentId, schemaType: documentSchemaType})

  const assistDocLoaded = !!assistDocument
  const currentUser = useCurrentUser()
  const toast = useToast()
  const tasks = assistDocument?.tasks
  const previousTasks = useRef<InstructionTask[] | undefined | 'initial'>('initial')

  useEffect(() => {
    if (!assistDocLoaded) {
      return
    }

    if (previousTasks.current !== 'initial') {
      const prevTaskByKey = Object.fromEntries(
        (previousTasks.current ?? NO_TASKS).map((run) => [run._key, run]),
      )
      const endedTasks = tasks
        ?.filter((task) => task.startedByUserId === currentUser?.id)
        .filter((task) => {
          const prevTask = prevTaskByKey[task._key]
          return (!prevTask && task.ended) || (!prevTask?.ended && task.ended)
        })
        // filter out old stuff
        .filter((task) => task.ended && isAfter(addSeconds(new Date(task.ended), 30), new Date()))

      endedTasks?.forEach((task) => {
        const title = task.title ?? getInstructionTitle(task.instruction)
        if (task.reason === 'error') {
          toast.push({
            title: `Failed: ${title}`,
            status: 'error',
            description: `Instruction failed. ${task.message ?? ''}`,
            closable: true,
            duration: 10000,
          })
        } else if (task.reason === 'timeout') {
          toast.push({
            title: `Timeout: ${title}`,
            status: 'error',
            description: `Instruction timed out.`,
            closable: true,
          })
        } else if (task.reason === 'success') {
          toast.push({
            title: `Success: ${title}`,
            status: 'success',
            description: `Instruction completed.`,
            closable: true,
          })
        } else if (task.reason === 'aborted') {
          toast.push({
            title: `Canceled: ${title}`,
            status: 'warning',
            description: `Instruction canceled.`,
            closable: true,
          })
        }
      })
    }
    previousTasks.current = tasks
  }, [tasks, previousTasks, toast, currentUser, assistDocLoaded])
}
