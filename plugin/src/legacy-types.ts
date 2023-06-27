import {SanityDocument} from 'sanity'
import {PortableTextBlock, PortableTextMarkDefinition, PortableTextSpan} from '@portabletext/types'

//id prefixes
export const legacyAssistDocumentIdPrefix = 'sanity.ai.'

export const legacyAssistDocumentTypeName = 'sanity.ai.docType' as const
const aiFieldTypeName = 'sanity.ai.docType.field' as const
const instructionTypeName = 'sanity.ai.field.instruction' as const

const userInputTypeName = 'sanity.ai.prompt.userInput' as const
const promptContextTypeName = 'sanity.ai.prompt.context' as const
const fieldReferenceTypeName = 'sanity.ai.prompt.fieldRef' as const

export const legacyContextDocumentTypeName = 'ai.instruction.context' as const

export const legacyAssistStatusDocumentTypeName = 'sanity.ai.instructionStatus' as const

export interface FieldPrompts {
  _key: string
  _type: typeof aiFieldTypeName
  path?: string
  instructions?: LegacyInstruction[]
}

export interface LegacyAssistDocument extends SanityDocument {
  fields: FieldPrompts[]
}

export interface LegacyFieldRef extends PortableTextMarkDefinition {
  _type: typeof fieldReferenceTypeName
  path?: string
}

export interface LegacyContextBlock {
  _type: typeof promptContextTypeName
  reference?: {
    _type: 'reference'
    _ref?: string
  }
}

export interface LegacyUserInputBlock {
  _type: typeof userInputTypeName
  _key: string
  message?: string
  description?: string
}

export type LegacyPromptTextBlock = PortableTextBlock<
  never,
  PortableTextSpan | LegacyFieldRef | LegacyUserInputBlock | LegacyContextBlock,
  'normal',
  never
>

export type LegacyPromptBlock =
  | LegacyPromptTextBlock
  | LegacyFieldRef
  | LegacyContextBlock
  | LegacyUserInputBlock

export interface LegacyInstruction {
  _key: string
  _type: typeof instructionTypeName
  prompt?: LegacyPromptBlock[]

  icon?: string
  userId?: string
  title?: string
  placeholder?: string
}
