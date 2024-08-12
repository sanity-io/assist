import {
  CheckmarkCircleIcon,
  ClockIcon,
  CloseCircleIcon,
  ErrorOutlineIcon,
  SyncIcon,
} from '@sanity/icons'
import {
  Box,
  Button,
  Card,
  Flex,
  Popover,
  Spinner,
  Stack,
  Text,
  useClickOutside,
  useGlobalKeyDown,
  useLayer,
} from '@sanity/ui'
import {createElement, type ForwardedRef, forwardRef, useCallback, useMemo, useState} from 'react'
import {StatusButton, type StatusButtonProps, typed, useClient} from 'sanity'
import {keyframes, styled} from 'styled-components'

import {TimeAgo} from '../components/TimeAgo'
import {maxHistoryVisibilityMs, pluginTitle} from '../constants'
import {assistTasksStatusId} from '../helpers/ids'
import {getInstructionTitle} from '../helpers/misc'
import type {AssistTasksStatus, InstructionTask, StudioInstruction, TaskEndedReason} from '../types'

export interface InstructionTaskHistoryButtonProps {
  documentId?: string
  tasks: InstructionTask[] | undefined
  instructions: StudioInstruction[] | undefined
  showTitles: boolean
}

interface CancelableInstructionTask extends InstructionTask {
  cancel: () => void
  title?: string
}

const rotate = keyframes`
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
`

const SyncSpinningIcon = styled(SyncIcon)`
  animation: ${rotate} 1s linear infinite;
`

const TASK_CONFIG = {
  aborted: {
    title: 'Canceled',
    icon: CloseCircleIcon,
    tone: 'transparent',
  },
  error: {
    title: 'Error',
    icon: ErrorOutlineIcon,
    tone: 'critical',
  },
  success: {
    title: 'Completed',
    icon: CheckmarkCircleIcon,
    tone: 'positive',
  },
  timeout: {
    title: 'Timeout',
    icon: ClockIcon,
    tone: 'caution',
  },
} as const

export function InstructionTaskHistoryButton(props: InstructionTaskHistoryButtonProps) {
  const {tasks, instructions, documentId, showTitles} = props

  const client = useClient({apiVersion: '2023-01-01'})
  const cancelRun = useCallback(
    (taskKey: string) => {
      if (!documentId) {
        return
      }
      const statusDocId = assistTasksStatusId(documentId)
      const basePath = `${typed<keyof AssistTasksStatus>('tasks')}[_key=="${taskKey}"]`
      client
        .patch(statusDocId)
        .set({
          [`${basePath}.${typed<keyof InstructionTask>('ended')}`]: new Date().toISOString(),
          [`${basePath}.${typed<keyof InstructionTask>('reason')}`]:
            typed<TaskEndedReason>('aborted'),
        })
        .commit()
        .catch(console.error)
    },
    [client, documentId],
  )

  const titledTasks = useMemo(() => {
    const t =
      tasks
        ?.filter(
          (task) =>
            task.started &&
            new Date().getTime() - new Date(task.started).getTime() < maxHistoryVisibilityMs,
        )
        .map((task): CancelableInstructionTask => {
          const instruction = instructions?.find((i) => i._key === task.instructionKey)
          return {
            ...task,
            title: showTitles ? (task.title ?? getInstructionTitle(instruction)) : undefined,
            cancel: () => cancelRun(task._key),
          }
        }) ?? []
    t.sort((a, b) => new Date(b.started ?? '').getTime() - new Date(a.started ?? '').getTime())
    return t
  }, [tasks, instructions, cancelRun, showTitles])

  // const id = useId()

  const isRunning = useMemo(() => titledTasks.some((r) => !r.ended), [titledTasks])
  const hasErrors = useMemo(
    () => titledTasks.some((r) => r.reason === 'error' || r.reason === 'timeout'),
    [titledTasks],
  )

  const [open, setOpen] = useState(false)

  const toggleOpen = useCallback(() => setOpen((v) => !v), [])

  const [button, setButton] = useState<HTMLButtonElement | null>(null)
  const [popover, setPopover] = useState<HTMLDivElement | null>(null)

  const handleClickOutside = useCallback(() => {
    setOpen(false)
  }, [])

  useClickOutside(handleClickOutside, [button, popover])

  const handleEscape = useCallback(() => {
    setOpen(false)
    button?.focus()
  }, [button])

  return (
    <Popover
      constrainSize
      content={<TaskList onEscape={handleEscape} tasks={titledTasks} />}
      open={open && !!titledTasks?.length}
      placement="top"
      portal
      ref={setPopover}
      width={0}
    >
      <TaskStatusButton
        disabled={!titledTasks?.length}
        hasErrors={hasErrors}
        isRunning={isRunning}
        onClick={toggleOpen}
        ref={setButton}
        selected={open}
      />
    </Popover>
  )
}

const TASK_STATUS_BUTTON_TOOLTIP_PROPS: StatusButtonProps['tooltipProps'] = {
  placement: 'top',
}

const TaskStatusButton = forwardRef(function TaskStatusButton(
  props: {
    disabled: boolean
    hasErrors: boolean
    isRunning: boolean
    onClick: () => void
    selected: boolean
  },
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const {disabled, hasErrors, isRunning, onClick, selected} = props

  return (
    <StatusButton
      label={`${pluginTitle} status`}
      aria-label={`${pluginTitle} status`}
      icon={isRunning ? SyncSpinningIcon : hasErrors ? ErrorOutlineIcon : CheckmarkCircleIcon}
      mode="bleed"
      onClick={onClick}
      tone={hasErrors ? 'critical' : undefined}
      disabled={disabled}
      ref={ref}
      selected={selected}
      tooltipProps={TASK_STATUS_BUTTON_TOOLTIP_PROPS}
    />
  )
})

function TaskList(props: {onEscape: () => void; tasks: CancelableInstructionTask[]}) {
  const {onEscape, tasks} = props

  const {isTopLayer} = useLayer()

  useGlobalKeyDown(
    useCallback(
      (event) => {
        if (isTopLayer && event.key === 'Escape') {
          onEscape()
        }
      },
      [isTopLayer, onEscape],
    ),
  )

  return (
    <Stack padding={1} space={1}>
      {tasks.map((task) => (
        <TaskItem key={task._key} task={task} />
      ))}
    </Stack>
  )
}

function TaskItem(props: {task: CancelableInstructionTask}) {
  const {task} = props

  const taskType = task.reason && TASK_CONFIG[task.reason]
  return (
    <Card radius={2} tone={taskType && taskType?.tone}>
      <Flex align="center" gap={1}>
        <Flex align="flex-start" flex={1} gap={3} padding={3}>
          <Box flex="none">
            <Text size={1}>
              {taskType && createElement(taskType.icon)}
              {!task.reason && <Spinner />}
            </Text>
          </Box>
          <Stack flex={1} space={2}>
            <Text size={1} weight="medium">
              {taskType ? taskType.title : 'Running'}
              {task.title && <>: {task.title}</>}
            </Text>
            {task.message ? <Text size={1}>{task.message}</Text> : null}
            <Text muted size={1}>
              <TimeAgo date={task.ended ?? task.started} />
            </Text>
          </Stack>
        </Flex>

        {!task.ended && (
          <Box flex="none" padding={1}>
            <Button fontSize={1} mode="bleed" onClick={task.cancel} text="Cancel" />
          </Box>
        )}
      </Flex>
    </Card>
  )
}
