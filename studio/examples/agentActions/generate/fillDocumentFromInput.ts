import {type AssistFieldActionProps, defineAssistFieldAction, useUserInput} from '@sanity/assist'
import {useMemo} from 'react'
import {ComposeIcon} from '@sanity/icons'
import {useClient} from 'sanity'

/**
 * This action will generate a new value for the document based on user provided input.
 *
 * This action will:
 * - open a dialog for the user to describe what they want the document to be about
 * - create the document if it is new (passing along any initial values in the form)
 * - pass along any conditional hidden and readOnly state in the current form, so the action only visits visible, writable fields
 * - use the user input to create the Generate instruction
 *
 * Do remove and modify the instruction as needed.
 *
 * ### Usage
 * ```ts
 * import {useMemo} from 'react'
 * import {type AssistFieldActionProps} from '@sanity/assist'
 * import {useFillDocumentFromInput} from './generate/fillDocumentFromInput'
 *
 * function useFieldActions(props: AssistFieldActionProps) {
 *   const fillDocumentFromInput = useFillDocumentFromInput(props)
 *   return useMemo(() => [fillDocumentFromInput], [fillDocumentFromInput])
 * }
 * ```
 * @param props
 */
export function useFillDocumentFromInput(props: AssistFieldActionProps) {
  const {
    actionType,
    documentIdForAction,
    documentSchemaType,
    getConditionalPaths,
    getDocumentValue,
    schemaId,
  } = props

  const client = useClient({apiVersion: 'vX'})
  const getUserInput = useUserInput()

  return useMemo(() => {
    if (actionType !== 'document') {
      return undefined
    }
    return defineAssistFieldAction({
      title: 'Fill document...',
      icon: ComposeIcon,
      onAction: async () => {
        const userInput = await getUserInput({
          title: 'What should the document be about?',
          inputs: [
            {
              id: 'topic',
              title: 'Instruction',
              description:
                'Describe what the document should be about. ' +
                'Feel free to provide material for that will be used to create the document.',
            },
          ],
        })

        if (!userInput) {
          return undefined // user closed the dialog
        }

        const [{result: instruction}] = userInput
        await client.agent.action.generate({
          schemaId,
          targetDocument: {
            operation: 'createIfNotExists',
            _id: documentIdForAction,
            _type: documentSchemaType.name,
            initialValues: getDocumentValue(),
          },
          instruction: `
                        Populate a document in full, based on a user instruction.
                        The document type is ${documentSchemaType.name}, and the document type title is ${documentSchemaType.title}
                        Pay attention to the language used in the user description, and use the same language for the document content.
                        ---
                        The user instruction is:
                        ${instruction}
                        ---
                     `,
          target: {
            operation: 'set',
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
    getUserInput,
    schemaId,
  ])
}
