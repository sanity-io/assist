import {useMemo} from 'react'
import {type FormNodePresence, isKeySegment, type Path, stringToPath} from 'sanity'

import {useAssistDocumentContext} from '../assistDocument/AssistDocumentContext'
import {maxHistoryVisibilityMs, pluginTitle} from '../constants'
import type {AiPresence} from '../types'

const NO_PRESENCE: FormNodePresence[] = []

export function useAssistPresence(path: Path, showFocusWithin?: boolean): FormNodePresence[] {
  const context = useAssistDocumentContext()
  const assistDocument = context && 'assistDocument' in context ? context.assistDocument : undefined
  const tasks = assistDocument?.tasks

  return useMemo(() => {
    const activePresence = tasks
      ?.filter((task) => !task.ended)
      ?.flatMap((task) => task.presence ?? [])
      ?.filter(
        (p) =>
          p.started &&
          new Date().getTime() - new Date(p.started).getTime() < maxHistoryVisibilityMs,
      )
      .filter((presence) => {
        if (!presence.path || !path.length) {
          return false
        }
        const statusPath = stringToPath(presence.path)

        if (!showFocusWithin && statusPath.length !== path.length) {
          return false
        }

        return path.every((pathSegment, i) => {
          const statusSegment = statusPath[i]
          if (typeof pathSegment === 'string') {
            return pathSegment === statusSegment
          }
          if (isKeySegment(pathSegment) && isKeySegment(statusSegment)) {
            return pathSegment._key === statusSegment._key
          }
          return false
        })
      })
    if (!activePresence?.length) {
      return NO_PRESENCE
    }

    return activePresence.map((status) => aiPresence(status, path))
  }, [showFocusWithin, tasks, path])
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function aiPresence(presence: AiPresence, path: Path, title?: string): FormNodePresence {
  return {
    user: {
      id: `sanity-assistant_${presence._key}`,
      displayName: pluginTitle,
    },
    path: path,
    sessionId: 'not-available',
    lastActiveAt: presence?.started ?? new Date().toISOString(),
  }
}
