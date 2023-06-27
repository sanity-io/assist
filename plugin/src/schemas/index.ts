import {
  assistDocumentSchema,
  documentInstructionStatus,
  fieldInstructions,
  fieldReference,
  instruction,
  instructionTask,
  prompt,
  promptContext,
  userInput,
} from './assistDocumentSchema'
import {contextDocumentSchema} from './contextDocumentSchema'

export const schemaTypes = [
  fieldInstructions,
  assistDocumentSchema,
  prompt,
  fieldReference,
  instruction,
  documentInstructionStatus,
  instructionTask,
  contextDocumentSchema,
  userInput,
  promptContext,
]
