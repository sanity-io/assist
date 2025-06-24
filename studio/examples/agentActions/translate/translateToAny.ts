import {type AssistFieldActionProps, defineAssistFieldAction, useUserInput} from '@sanity/assist'
import {useMemo} from 'react'
import {TranslateIcon} from '@sanity/icons'
import {useClient} from 'sanity'

/**
 * This action will translate the document or field into whatever language the user requests.
 *
 * Modify the instruction as needed.
 *
 * ### Usage
 * ```ts
 * import {useMemo} from 'react'
 * import {type AssistFieldActionProps} from '@sanity/assist'
 * import {useTranslateToAny} from './translate/useTranslateToAny'
 *
 * function useFieldActions(props: AssistFieldActionProps) {
 *   const translateToAny = useTranslateToAny(props)
 *   return useMemo(() => [translateToAny], [translateToAny])
 * }
 * ```
 * @param props
 */
export function useTranslateToAny(props: AssistFieldActionProps) {
  const {documentIdForAction, getConditionalPaths, path, schemaId} = props

  const client = useClient({apiVersion: 'vX'})
  const getUserInput = useUserInput()

  return useMemo(() => {
    return defineAssistFieldAction({
      title: 'Translate to language...',
      icon: TranslateIcon,
      onAction: async () => {
        const userInput = await getUserInput({
          title: 'Translate',
          inputs: [
            {
              id: 'instruction',
              title: 'Language',
              description: 'Which language do you want to translate to?',
            },
          ],
        })

        if (!userInput) {
          return undefined // user closed the dialog
        }

        const [{result: userLanguage}] = userInput

        await client.agent.action.translate({
          schemaId,
          documentId: documentIdForAction,
          // this is just fox example purposes: it is reccomended to use real language ids, not ones provided by a user string
          toLanguage: {
            title: userLanguage,
            id: userLanguage,
          },
          // no need to send path for document actions
          target: path.length ? {path} : undefined,
          conditionalPaths: {paths: getConditionalPaths()},
        })
      },
    })
  }, [client, documentIdForAction, getConditionalPaths, path, schemaId, getUserInput])
}
