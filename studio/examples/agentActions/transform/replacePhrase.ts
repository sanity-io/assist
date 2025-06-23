import {type AssistFieldActionProps, defineAssistFieldAction, useUserInput} from '@sanity/assist'
import {useMemo} from 'react'
import {TranslateIcon} from '@sanity/icons'
import {useClient} from 'sanity'

/**
 * This action will replace a user provided words or phrases in the document or field (and any nested fields) it is invoked for.
 *
 * Modify the instruction as needed.
 *
 * ### Usage
 * ```ts
 * import {type AssistFieldActionProps} from '@sanity/assist'
 * import {useReplacePhrases} from './transform/useReplacePhrases.ts'
 *
 * function useFieldActions(props: AssistFieldActionProps) {
 *   const replacePhrases = useReplacePhrases(props)
 *   return useMemo(() => [replacePhrases], [replacePhrases])
 * }
 * ```
 * @param props
 */
export function useReplacePhrases(props: AssistFieldActionProps) {
  const {documentIdForAction, getConditionalPaths, path, schemaId} = props

  const client = useClient({apiVersion: 'vX'})
  const getUserInput = useUserInput()

  return useMemo(() => {
    return defineAssistFieldAction({
      title: 'Replace word or phrase...',
      icon: TranslateIcon,
      onAction: async () => {
        const userInput = await getUserInput({
          title: 'Replaces word(s) or phrase(s)',
          inputs: [
            {
              id: 'instruction',
              title: 'Word(s) or phrase(s)',
              description:
                'Explain the words or phases you want to replace, and what you want them replaced with.',
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
            'A user wants to replace words or phrases according to their instruction:',
            instruction,
            '---',
          ].join('/n'),
          // no need to send path for document actions
          target: path.length ? {path} : undefined,
          conditionalPaths: {paths: getConditionalPaths()},
        })
      },
    })
  }, [client, documentIdForAction, getConditionalPaths, path, schemaId, getUserInput])
}
