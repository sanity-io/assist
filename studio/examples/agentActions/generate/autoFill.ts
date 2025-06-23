import {type AssistFieldActionProps, defineAssistFieldAction} from '@sanity/assist'
import {useMemo} from 'react'
import {EditIcon} from '@sanity/icons'
import {pathToString, useClient} from 'sanity'

/**
 * This action will generate a new value for the document or field it is invoked for.
 * The value will be contextually based on what is already in the document, and use the language
 * in a `language` field (if present).
 *
 * This action will:
 * - create the document if it is new (passing along any initial values in the form)
 * - pass along any conditional hidden and readOnly state in the current form, so the action only visits visible, writable fields
 * - use the default Generate operation for the target: 'mixed'. Change this to 'set' as needed
 *
 * Do remove and modify the instruction as needed.
 *
 * ### Usage
 * ```ts
 * import {useMemo} from 'react'
 * import {type AssistFieldActionProps} from '@sanity/assist'
 * import {useAutoFillFieldAction} from './generate/autoFillFieldAction'
 *
 * function useFieldActions(props: AssistFieldActionProps) {
 *   const autoFillFieldAction = useAutoFillFieldAction(props)
 *   return useMemo(() => [autoFillFieldAction], [autoFillFieldAction])
 * }
 * ```
 * @param props
 */
export function useAutoFillFieldAction(props: AssistFieldActionProps) {
  const {
    actionType,
    documentIdForAction,
    documentSchemaType,
    getConditionalPaths,
    getDocumentValue,
    path,
    schemaId,
    schemaType,
  } = props

  const client = useClient({apiVersion: 'vX'})

  return useMemo(() => {
    return defineAssistFieldAction({
      title: actionType ? 'Autofill field' : 'Autofill document',
      icon: EditIcon,
      onAction: async () => {
        await client.agent.action.generate({
          schemaId,
          targetDocument: {
            operation: 'createIfNotExists',
            _id: documentIdForAction,
            _type: documentSchemaType.name,
            initialValues: getDocumentValue(),
          },
          instruction: `
                        We are generating a new value for a document field.
                        The document type is ${documentSchemaType.name}, and the document type title is ${documentSchemaType.title}
                        The document language is: "$lang" (use en-US if unspecified)
                        The document value is:
                        $doc
                        ---
                        We are in the following field:
                        JSON-path: ${pathToString(path)}
                        Title: ${schemaType.title}
                        Value: $field (consider it empty if undefined)
                        ---
                        Generate a new field value. The new value should be relevant to the document type and context.
                        Keep it interesting. Generate using the document language.
                     `,
          instructionParams: {
            doc: {type: 'document'},
            field: {type: 'field', path},
            lang: {type: 'field', path: ['language']},
          },
          target: {
            // mixed: Append to array-like fields, set non-array fields. Change to 'set' as needed
            operation: 'mixed',
            path,
          },
          conditionalPaths: {
            paths: getConditionalPaths(),
          },
        })
      },
    })
  }, [
    client,
    actionType,
    documentIdForAction,
    documentSchemaType,
    getConditionalPaths,
    getDocumentValue,
    path,
    schemaId,
    schemaType,
  ])
}
