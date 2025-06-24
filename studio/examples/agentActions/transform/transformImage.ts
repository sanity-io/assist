import {
  type AssistFieldActionProps,
  defineAssistFieldAction,
  isType,
  useUserInput,
} from '@sanity/assist'
import {useMemo} from 'react'
import {TranslateIcon} from '@sanity/icons'
import {useClient} from 'sanity'

/**
 * This action appears on image fields and prompts the user to describe how they want the image transformed.
 *
 * Modify the instruction as needed.
 *
 * ### Usage
 * ```ts
 * import {type AssistFieldActionProps} from '@sanity/assist'
 * import {useTransformImage} from './transform/useTransformImage.ts'
 *
 * function useFieldActions(props: AssistFieldActionProps) {
 *   const transformImage = useTransformImage(props)
 *   return useMemo(() => [transformImage], [transformImage])
 * }
 * ```
 * @param props
 */
export function useTransformImage(props: AssistFieldActionProps) {
  const {documentIdForAction, schemaType, getConditionalPaths, path, schemaId} = props

  const client = useClient({apiVersion: 'vX'})
  const getUserInput = useUserInput()

  return useMemo(() => {
    if (!isType(schemaType, 'image')) {
      return undefined
    }
    return defineAssistFieldAction({
      title: 'Transform image...',
      icon: TranslateIcon,
      onAction: async () => {
        const userInput = await getUserInput({
          title: 'Transform image',
          inputs: [
            {
              id: 'instruction',
              title: 'Transformation',
              description: 'Describe how you want the image transformed',
            },
          ],
        })

        if (!userInput) {
          return undefined // user closed the dialog
        }

        const [{result: instruction}] = userInput

        await client.agent.action.transform({
          schemaId,
          documentId: documentIdForAction,
          instruction: [
            'Transform the image according to the following instruction:',
            instruction,
            '---',
          ].join('\n'),
          target: {path: [...path, 'asset']},
          conditionalPaths: {paths: getConditionalPaths()},
        })
      },
    })
  }, [client, documentIdForAction, schemaType, getConditionalPaths, path, schemaId, getUserInput])
}
