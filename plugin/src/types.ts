import {PortableTextBlock, PortableTextMarkDefinition, PortableTextSpan} from '@portabletext/types'
import {SanityDocument} from 'sanity'

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

export const outputFieldTypeName = 'sanity.assist.output.field' as const
export const outputTypeTypeName = 'sanity.assist.output.type' as const

//url params
export const inspectParam = 'inspect' as const
export const fieldPathParam = 'pathKey' as const
export const instructionParam = 'instruction' as const

// other constants
export const documentRootKey = '<document>'

export type SerializedSchemaMember = Omit<SerializedSchemaType, 'name' | '_type'> & {
  _type?: typeof assistSerializedFieldTypeName
  name?: string
}

export interface SerializedSchemaType {
  _type?: typeof assistSerializedTypeName
  _id?: string
  type: string
  name: string
  title?: string
  fields?: SerializedSchemaMember[]
  of?: SerializedSchemaMember[]
  to?: SerializedSchemaMember[]
  annotations?: SerializedSchemaMember[]
  inlineOf?: SerializedSchemaMember[]
  values?: string[] | {value: string; title?: string}[]
  hidden?: boolean | 'function'
  readOnly?: boolean | 'function'
  options?: {
    /** equivalent to options.aiAssist.imageDescriptionField - not renamed in the api for backwards compatability */
    imagePromptField?: string
    embeddingsIndex?: string
  }
}

export interface AssistDocument extends SanityDocument {
  fields?: AssistField[]
  instructions?: StudioInstruction[]
}

export interface PresetInstruction {
  _key: string
  prompt?: PromptTextBlock[]

  title?: string
  /**
   * String key from `@sanity/icons` IconMap
   */
  icon?: string

  /**
   * Type/field filter
   */
  output?: (OutputFieldItem | OutputTypeItem)[]
}

export interface PresetField {
  path?: string
  instructions?: PresetInstruction[]
}

export interface AssistPreset {
  fields?: PresetField[]
}

export interface SanityAssistDocument {
  _id: string
  _type: typeof assistDocumentTypeName
  fields?: StudioAssistField[]
}

export interface StudioAssistDocument extends SanityAssistDocument {
  // added after loading
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
export type PromptTextBlock = Omit<
  PortableTextBlock<never, InlinePromptBlock, 'normal', never>,
  '_type'
> & {_type: 'block'}

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
  title?: string
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
  output?: (OutputFieldItem | OutputTypeItem)[]

  //added after query / synthetic fields
  tasks?: InstructionTask[]
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

export interface OutputFieldItem {
  _type: typeof outputFieldTypeName
  _key: string
  //path relative to the field the instruction is for (same as _key)
  relativePath?: string
}

export interface OutputTypeItem {
  _type: typeof outputTypeTypeName
  _key: string
  /* array item type name */
  type?: string
  //path relative to the array-field the instruction is for, can be empty string (the array itself, same as _key)
  relativePath?: string
}
