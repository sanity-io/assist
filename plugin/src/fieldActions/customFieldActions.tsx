import {
  DocumentFieldActionDivider,
  DocumentFieldActionGroup,
  DocumentFieldActionItem,
  DocumentFieldActionNode,
  ObjectSchemaType,
  Path,
  SanityDocumentLike,
  SchemaType,
  useWorkspaceSchemaId,
} from 'sanity'
import {useMemo} from 'react'
import {useAiAssistanceConfig} from '../assistLayout/AiAssistanceConfigContext'
import {ToastParams, useToast} from '@sanity/ui'
import {AgentActionPath} from '@sanity/client/stega'
import {useAssistDocumentContext} from '../assistDocument/AssistDocumentContext'
import {
  documentRootKey,
  fieldPresenceTypeName,
  InstructionTask,
  instructionTaskTypeName,
} from '../types'
import {randomKey} from '../_lib/randomKey'
import {isDefined} from '../helpers/misc'

export interface AgentActionConditionalPath {
  path: AgentActionPath
  readOnly: boolean
  hidden: boolean
}

export interface AssistFieldActionProps {
  /**
   * `actionType` will be `document` for action invoked from the top right document action menu, and
   * `field` when invoked from a field action menu.
   */
  actionType: 'document' | 'field'
  /**
   * This is the id of the current document pane; it contains `drafts.`or `versions. prefix` ect depending on context.
   * Use this for `documentId` when calling any `client.agent.action`.
   *
   * It is generally recommended to call actions from the studio like this:
   * ```ts
   * await client.agent.action.generate({
   *   targetDocument: {
   *      operation: 'createIfNotExists',
   *      _id: props.documentIdForAction,
   *      _type: props.documentSchemaType.name,
   *      initialValues: props.getDocumentValue()
   *   },
   *   //...
   * })
   * ```
   */
  documentIdForAction: string

  /**
   * Schema type of the current document.
   * @see documentIdForAction
   */
  documentSchemaType: ObjectSchemaType

  /**
   * Returns the current document value.
   *
   * Prefer passing this function to your hooks instead of passing the document value directly to avoid unnecessary re-renders.
   * @see documentIdForAction
   */
  getDocumentValue: () => SanityDocumentLike

  /**
   * Returns the current readOnly and hidden state of all conditional members in the current document form.
   *
   * Intended to be passed to agent actions `conditionalPaths.paths`.
   */
  getConditionalPaths: () => AgentActionConditionalPath[]

  /**
   * `schemaId` for the current workspace.
   *
   * Note: the workspace schema has to be deployed using `sanity schema deploy` or `sanity deploy`.
   *
   * Use this for `schemaId` when calling any `client.agent.action`.
   *
   * It is generally recommended to call actions from the studio like this:
   * ```ts
   * await client.agent.action.generate({
   *   targetDocument: {
   *      operation: 'createIfNotExists',
   *      _id: props.documentIdForAction,
   *      _type: props.documentSchemaType.name,
   *      initialValues: props.getDocumentValue()
   *   },
   *   //...
   * })
   *
   * ```
   */
  schemaId: string

  /**
   * This is the schema type of the field the actions will be attached to (ie, schemaType for `path`)
   *
   * It can be used with agent actions using `target.path`, to scope the action to a specific field.
   *
   * It is generally recommended to call actions from the studio like this:
   * ```ts
   * await client.agent.action.generate({
   *   targetDocument: {
   *      operation: 'createIfNotExists',
   *      _id: props.documentIdForAction,
   *      _type: props.documentSchemaType.name,
   *      initialValues: props.getDocumentValue()
   *   },
   *   target: {
   *      path: props.path
   *   },
   * })
   * ```
   */
  path: AgentActionPath

  /**
   * This is the schema type of the field the actions will be attached to (ie, schemaType for `path`).
   *
   * Typically useful to dynamically return different actions based on the schema type of the field.
   *
   * ```ts
   * if(isObjectSchemaType(schemaType)) {
   *   return [
   *     defineAssistFieldAction({
   *       title: 'Fill the object fields',
   *       icon: RobotIcon,
   *       onAction: () => {
   *         //...
   *       }
   *     })
   *   ]
   * }
   * return useMemo(() => {
   *
   *
   * }, [])
   *
   * ```
   */
  schemaType: SchemaType

  /**
   * Schema type of the parent field or array item holding this field.
   *
   * This can be undefined if the action was unable to resolve the parent type is excluded from AI Assist.
   *
   * @see schemaType
   * @see documentSchemaType
   */
  parentSchemaType?: SchemaType
}

export type AssistFieldActionNode =
  | AssistFieldActionItem
  | AssistFieldActionGroup
  | DocumentFieldActionDivider

export type AssistFieldActionItem = Omit<
  DocumentFieldActionItem,
  'renderAsButton' | 'selected' | 'onAction'
> & {
  onAction: () => void | Promise<void>
}

export type AssistFieldActionGroup = Omit<
  DocumentFieldActionGroup,
  'renderAsButton' | 'expanded' | 'children'
> & {
  /**
   * `children` can include undefined entries in the action array. These will be filtered out.
   * If the group has no defined children, the group will also be filtered out.
   */
  children: (AssistFieldActionNode | undefined)[]
}

type PushToast = (params: ToastParams) => string

export function defineAssistFieldAction(
  action: Omit<AssistFieldActionItem, 'type'>,
): AssistFieldActionItem {
  return {
    ...action,
    type: 'action',
  }
}

export function defineFieldActionDivider(): DocumentFieldActionDivider {
  return {
    type: 'divider',
  }
}

export function defineAssistFieldActionGroup(
  group: Omit<AssistFieldActionGroup, 'type'>,
): AssistFieldActionGroup {
  return {
    ...group,
    type: 'group',
  }
}

export function useCustomFieldActions(
  props: Omit<AssistFieldActionProps, 'schemaId' | 'path'> & {path: Path},
) {
  const {
    config: {fieldActions},
  } = useAiAssistanceConfig()
  const {addSyntheticTask, removeSyntheticTask} = useAssistDocumentContext()

  const schemaId = useWorkspaceSchemaId()
  const {push: pushToast} = useToast()
  const configActions = fieldActions?.useFieldActions?.({
    ...props,
    schemaId,
    path: props.path as AgentActionPath,
  })

  return useMemo(() => {
    const title = fieldActions?.title
    const customActions = configActions
      ?.filter(isDefined)
      .map((node) => {
        return createSafeNode({
          node,
          pushToast,
          addSyntheticTask,
          removeSyntheticTask,
        })
      })
      .filter(isDefined)
    const onlyGroups =
      customActions?.length && customActions?.every((node) => node.type === 'group')
    const groups = customActions?.length
      ? onlyGroups
        ? customActions
        : [
            {
              type: 'group',
              title: title || 'Custom actions',
              children: customActions,
              expanded: true,
            } satisfies DocumentFieldActionGroup,
          ]
      : []
    return groups ?? []
  }, [configActions, fieldActions, pushToast])
}

function createSafeNode(args: {
  node: AssistFieldActionNode
  pushToast: PushToast
  addSyntheticTask: (task: InstructionTask) => void
  removeSyntheticTask: (task: InstructionTask) => void
}): DocumentFieldActionNode | undefined {
  const {node} = args
  switch (node.type) {
    case 'action':
      return createSafeAction({...args, action: node})
    case 'group':
      // eslint-disable-next-line no-case-declarations
      const children = node.children
        ?.filter(isDefined)
        .map((child) => createSafeNode({...args, node: child}))
        .filter(isDefined)
      if (!children?.length) {
        return undefined
      }
      return {
        ...node,
        renderAsButton: false,
        expanded: true,
        children,
      }
    case 'divider':
    default:
      return node
  }
}

function createSafeAction(args: {
  action: AssistFieldActionItem
  pushToast: PushToast
  addSyntheticTask: (task: InstructionTask) => void
  removeSyntheticTask: (task: InstructionTask) => void
}) {
  const {action, pushToast, addSyntheticTask, removeSyntheticTask} = args
  return {
    ...action,
    onAction: () => {
      async function runAction() {
        const task: InstructionTask = {
          _type: instructionTaskTypeName,
          _key: randomKey(12),
          started: new Date().toISOString(),
          presence: [
            {
              _type: fieldPresenceTypeName,
              _key: randomKey(12),
              path: documentRootKey,
              started: new Date().toISOString(),
            },
          ],
        }
        try {
          addSyntheticTask(task)
          const actionResult = action.onAction?.()
          if (actionResult instanceof Promise) {
            await actionResult
          }
        } catch (err: any) {
          console.error('Failed to execute action', action, err)
          pushToast({
            title: 'Failed to execute action',
            description: err?.message,
            status: 'error',
          })
        } finally {
          removeSyntheticTask(task)
        }
      }
      runAction()
    },
    renderAsButton: false,
    selected: false,
  }
}
