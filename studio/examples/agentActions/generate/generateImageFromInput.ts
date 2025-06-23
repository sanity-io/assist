import {
  type AssistFieldActionProps,
  defineAssistFieldAction,
  isType,
  useUserInput,
} from '@sanity/assist'
import {useMemo} from 'react'
import {ComposeIcon} from '@sanity/icons'
import {useClient} from 'sanity'

/**
 * This action will appear on image fields (the object wrapper), and will:
 * - open a dialog for the user to describe what they want the document to be
 * - create the document if it is new (passing along any initial values in the form)
 * - pass along any conditional hidden and readOnly state in the current form, so the action only visits visible, writable fields
 * - generate a new image asset based on the user input
 *
 * Do modify the instruction as needed.
 *
 * ### Usage
 * ```ts
 * import {type AssistFieldActionProps} from '@sanity/assist'
 * import {useGenerateImageFromInput} from './generate/generateImageFromInput.ts'
 *
 * function useFieldActions(props: AssistFieldActionProps) {
 *   const imageFromInput = useGenerateImageFromInput(props)
 *   return useMemo(() => [imageFromInput], [imageFromInput])
 * }
 * ```
 * @param props
 */
export function useGenerateImageFromInput(props: AssistFieldActionProps) {
  const {
    documentIdForAction,
    documentSchemaType,
    getConditionalPaths,
    getDocumentValue,
    path,
    schemaId,
    schemaType,
  } = props

  const client = useClient({apiVersion: 'vX'})
  const getUserInput = useUserInput()

  return useMemo(() => {
    // only add to image fields
    if (!isType(schemaType, 'image')) {
      return undefined
    }

    return defineAssistFieldAction({
      title: 'Generate image...',
      icon: ComposeIcon,
      onAction: async () => {
        const userInput = await getUserInput({
          title: 'Describe the image',
          inputs: [
            {
              id: 'image-description',
              title: 'Image description',
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
                        Create an image based on the following instruction:
                        ${instruction}
                        ---
                     `,
          target: {
            operation: 'set',
            path: [...path, 'asset'],
          },
          conditionalPaths: {
            paths: getConditionalPaths(),
          },
        })
      },
    })
  }, [
    client,
    documentIdForAction,
    documentSchemaType,
    getConditionalPaths,
    getDocumentValue,
    getUserInput,
    path,
    schemaId,
    schemaType,
  ])
}
