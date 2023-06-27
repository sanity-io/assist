import {SanityDocument, ValidationMarker} from 'sanity'
import {PortableTextBlock, PortableTextMarkDefinition, PortableTextSpan} from '@portabletext/types'

//id prefixes
export const assistDocumentIdPrefix = 'sanity.assist.schemaType.'
export const assistDocumentStatusIdPrefix = 'sanity.assist.status.'
export const assistSchemaIdPrefix = 'sanity.assist.schema.'

// type names
export const assistDocumentTypeName = 'sanity.assist.schemaType.annotations' as const
export const assistFieldTypeName = 'sanity.assist.schemaType.field' as const
export const instructionTypeName = 'sanity.assist.instruction' as const
export const promptTypeName = 'sanity.assist.instruction.prompt' as const

export const userInputTypeName = 'sanity.assist.instruction.userInput' as const
export const instructionContextTypeName = 'sanity.assist.instruction.context' as const
export const fieldReferenceTypeName = 'sanity.assist.instruction.fieldRef' as const

// user-facing type. Intentionally does not have sanity. prefix
export const contextDocumentTypeName = 'assist.instruction.context' as const

export const assistTasksStatusTypeName = 'sanity.assist.task.status' as const
export const instructionTaskTypeName = 'sanity.assist.instructionTask' as const
export const fieldPresenceTypeName = 'sanity.assist.instructionTask.presence' as const

export const assistSerializedTypeName = 'sanity.assist.serialized.type' as const
export const assistSerializedFieldTypeName = 'sanity.assist.serialized.field' as const

//url params
export const inspectParam = 'inspect' as const
export const fieldPathParam = 'pathKey' as const
export const instructionParam = 'instruction' as const

// other constants
export const documentRootKey = '<document>'

export interface SerializedSchemaMember {
  _type?: typeof assistSerializedFieldTypeName
  type: string
  name: string
  title?: string
  values?: string[]
  of?: SerializedSchemaMember[]
  to?: {type: string}[]
}

export interface SerializedSchemaType {
  _type?: typeof assistSerializedTypeName
  _id?: string
  type: string
  title?: string
  name?: string
  fields?: SerializedSchemaMember[]
  of?: {type: string}[]
  to?: {type: string}[]
  options?: {
    imagePromptField?: string
  }
}

export interface AssistDocument extends SanityDocument {
  fields?: AssistField[]
  instructions?: StudioInstruction[]
}

export interface StudioAssistDocument {
  _id: string
  _type: typeof assistDocumentTypeName
  fields?: StudioAssistField[]

  // added
  tasks?: InstructionTask[]
}
export interface AssistField {
  _key: string
  _type: typeof assistFieldTypeName
  path?: string
  instructions?: StudioInstruction[]
}

export interface StudioAssistField {
  _key: string
  path?: string
  instructions?: StudioInstruction[]

  // added
  tasks?: InstructionTask[]
}

export interface FieldRef extends PortableTextMarkDefinition {
  _type: typeof fieldReferenceTypeName
  path?: string
}

export interface ContextBlock {
  _type: typeof instructionContextTypeName
  reference?: {
    _type: 'reference'
    _ref?: string
  }
}

export interface UserInputBlock {
  _type: typeof userInputTypeName
  _key: string
  message?: string
  description?: string
}

export type InlinePromptBlock = PortableTextSpan | FieldRef | UserInputBlock | ContextBlock
export type PromptTextBlock = PortableTextBlock<never, InlinePromptBlock, 'normal', never>

export type PromptBlock = PromptTextBlock | FieldRef | ContextBlock | UserInputBlock

export interface AiPresence {
  _key: string
  _type: typeof fieldPresenceTypeName
  path?: string
  started?: string
}

export type TaskEndedReason = 'success' | 'error' | 'aborted' | 'timeout'

export interface InstructionTask {
  _key: string
  _type: typeof instructionTaskTypeName
  instructionKey?: string
  path?: string
  started?: string
  updated?: string
  ended?: string
  message?: string
  reason?: TaskEndedReason
  presence?: AiPresence[]
  startedByUserId?: string

  //added by studio
  // eslint-disable-next-line no-use-before-define
  instruction?: StudioInstruction
}

export interface StudioInstruction {
  _key: string
  _type: typeof instructionTypeName
  prompt?: PromptBlock[]

  icon?: string
  userId?: string
  title?: string
  placeholder?: string

  //added after query / synthetic fields
  tasks?: InstructionTask[]
  validation?: ValidationMarker[]
}

export interface AssistTasksStatus {
  _id: string
  _type: typeof assistTasksStatusTypeName
  tasks?: InstructionTask[]
}

export interface AssistInspectorRouteParams {
  [inspectParam]?: string
  [fieldPathParam]?: string
  [instructionParam]?: string
}
