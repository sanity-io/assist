import {type AssistFieldActionProps, defineAssistFieldAction} from '@sanity/assist'
import {useMemo} from 'react'
import {TranslateIcon} from '@sanity/icons'
import {useClient} from 'sanity'

/**
 * This action will correct the spelling of the field (and any nested fields) it is invoked for.
 *
 * Modify the instruction as needed.
 *
 * ### Usage
 * ```ts
 * import {useMemo} from 'react'
 * import {type AssistFieldActionProps} from '@sanity/assist'
 * import {useFixSpelling} from './transform/useFixSpelling'
 *
 * function useFieldActions(props: AssistFieldActionProps) {
 *   const fixSpellingAction = useFixSpelling(props)
 *   return useMemo(() => [fixSpellingAction], [fixSpellingAction])
 * }
 * ```
 * @param props
 */
export function useFixSpelling(props: AssistFieldActionProps) {
  const {documentIdForAction, getConditionalPaths, path, schemaId} = props

  const client = useClient({apiVersion: 'vX'})

  return useMemo(() => {
    return defineAssistFieldAction({
      title: 'Fix spelling',
      icon: TranslateIcon,
      onAction: async () => {
        await client.agent.action.transform({
          schemaId,
          documentId: documentIdForAction,
          instruction: 'Fix any spelling mistakes',
          // no need to send path for document actions
          target: path.length ? {path} : undefined,
          conditionalPaths: {paths: getConditionalPaths()},
        })
      },
    })
  }, [client, documentIdForAction, getConditionalPaths, path, schemaId])
}
