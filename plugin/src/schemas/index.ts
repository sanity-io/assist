/* eslint-disable camelcase */
import {ArrayOfType, FieldProps, SchemaTypeDefinition} from 'sanity'

import {
  assistDocumentSchema,
  documentInstructionStatus,
  fieldInstructions,
  fieldReference,
  instruction,
  instructionTask,
  outputFieldType,
  outputTypeType,
  prompt,
  promptContext,
  userInput,
} from './assistDocumentSchema'
import {contextDocumentSchema} from './contextDocumentSchema'

function excludeComments<T extends SchemaTypeDefinition | ArrayOfType>(type: T): T {
  const existingRender = (type as any)?.components?.field
  return {
    ...type,
    ...('components' in type
      ? {
          components: {
            ...type.components,
            field: (props: FieldProps) => {
              const newProps = {...props, ...{__internal_comments: undefined}}
              if (typeof existingRender === 'function') {
                return existingRender(newProps)
              }
              return props.renderDefault(newProps)
            },
          },
        }
      : {}),
    ...('fields' in type
      ? {
          // recursively disable comments in fields
          fields: type.fields?.map((field) => excludeComments(field)),
        }
      : {}),
    ...('of' in type
      ? {
          // recursively disable comments in array items
          of: type.of?.map((arrayItemType) => excludeComments(arrayItemType)),
        }
      : {}),
  }
}

const instructionForm = [
  fieldInstructions,
  instruction,
  fieldReference,
  prompt,
  userInput,
  promptContext,
].map(excludeComments)

export const schemaTypes = [
  ...instructionForm,
  outputFieldType,
  outputTypeType,
  assistDocumentSchema,
  documentInstructionStatus,
  instructionTask,
  contextDocumentSchema,
]
