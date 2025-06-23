import {type AssistFieldActionProps, defineAssistFieldAction, isType} from '@sanity/assist'
import {useMemo} from 'react'
import {EditIcon} from '@sanity/icons'
import {isArrayOfObjectsSchemaType, pathToString, SchemaType, useClient} from 'sanity'
import {useToast} from '@sanity/ui'

/**
 * This action will generate a document summary for a string, text or portable text field.
 *
 * The action will only appear if the last segment in the path (the field name) has the word 'summary' or 'description' in it.
 * This logic should be adjusted to suit the needs of your schema. Consider using a schema option to control the behavior instead.
 *
 * This action will:
 * - do nothing if the document is not yet persisted (_createdAt not set on document value)
 * - pass along any conditional hidden and readOnly state in the current form, so the action only visits visible, writable fields
 * - generate a summary based on the full document value
 *
 * Modify the instruction as needed.
 *
 * ### Usage
 * ```ts
 * import {type AssistFieldActionProps} from '@sanity/assist'
 * import {useSummarizeDocument} from './generate/useSummarizeDocument.ts'
 *
 * function useFieldActions(props: AssistFieldActionProps) {
 *   const summarizeDocument = useSummarizeDocument(props)
 *   return useMemo(() => [summarizeDocument], [summarizeDocument])
 * }
 * ```
 * @param props
 */
export function useSummarizeDocument(props: AssistFieldActionProps) {
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
  const {push: pushToast} = useToast()

  return useMemo(() => {
    if (actionType !== 'field') {
      return undefined
    }

    const isSupportedType =
      isType(schemaType, 'string') || isType(schemaType, 'text') || isPortableTextArray(schemaType)
    if (!isSupportedType) {
      return undefined
    }

    const lastSegment = path.slice(-1)[0]
    console.log(lastSegment)
    if (
      typeof lastSegment !== 'string' ||
      !['summary', 'description'].some((contains) => lastSegment.toLowerCase().includes(contains))
    ) {
      return undefined
    }

    return defineAssistFieldAction({
      title: 'Summarize document',
      icon: EditIcon,
      onAction: async () => {
        if (!getDocumentValue()?._createdAt) {
          pushToast({
            title: 'Document is new',
            description:
              'The document is new, without meaningful content to summarize. Make an edit and try again.',
          })
          return
        }

        await client.agent.action.generate({
          schemaId,
          documentId: documentIdForAction,
          instruction: `
                        Given the following document:
                        $doc
                        ---
                        We are in the following field:
                        JSON-path: ${pathToString(path)}
                        Title: ${schemaType.title}
                        Description: ${schemaType.description ?? 'n/a'}
                        ---
                        Generate a summary of the document that is contextually relevant for the field.
                     `,
          instructionParams: {
            doc: {type: 'document'},
          },
          target: {
            operation: 'set',
            path,
          },
          conditionalPaths: {
            paths: getConditionalPaths(),
          },
        })
      },
    })
  }, [
    actionType,
    client,
    documentIdForAction,
    documentSchemaType,
    getConditionalPaths,
    getDocumentValue,
    path,
    schemaId,
    schemaType,
    pushToast,
  ])
}

export function isPortableTextArray(type: SchemaType) {
  return isArrayOfObjectsSchemaType(type) && type.of.some((t) => isType(t, 'block'))
}
