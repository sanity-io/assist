import {type AssistFieldActionProps, defineAssistFieldAction, useUserInput} from '@sanity/assist'
import {useMemo} from 'react'
import {HelpCircleIcon} from '@sanity/icons'
import {useClient} from 'sanity'
import {useToast} from '@sanity/ui'

/**
 * This action answers a question the user has about the current document.
 *
 * The action will appear in the top-right document action menu
 *
 * This action will:
 * - open a user dialog for the user to input their question
 * - show a toast with the answer
 *
 * Modify the instruction and ui logic as needed.
 *
 * ### Usage
 * ```ts
 * import {useMemo} from 'react'
 * import {type AssistFieldActionProps} from '@sanity/assist'
 * import {useAnswerQuestion} from './prompt/useAnswerQuestion'
 *
 * function useFieldActions(props: AssistFieldActionProps) {
 *   const answerQuestion = useAnswerQuestion(props)
 *   return useMemo(() => [answerQuestion], [answerQuestion])
 * }
 * ```
 * @param props
 */
export function useAnswerQuestion(props: AssistFieldActionProps) {
  const {actionType, documentIdForAction} = props

  const client = useClient({apiVersion: 'vX'})
  const {push: pushToast} = useToast()
  const getUserInput = useUserInput()

  return useMemo(() => {
    if (actionType !== 'document') {
      return undefined
    }

    return defineAssistFieldAction({
      title: 'Ask question about the document',
      icon: HelpCircleIcon,
      onAction: async () => {
        const userInput = await getUserInput({
          title: 'Document inquiry',
          inputs: [
            {
              id: 'question',
              title: 'Question',
              description: 'Describe what you would like to know about the current document.',
            },
          ],
        })

        if (!userInput) {
          return undefined // user closed the dialog
        }

        const [{result: question}] = userInput
        const answer = await client.agent.action.prompt({
          instruction: `
                        Given the following document:
                        $doc
                        ---
                        Answer the following user question:
                        ${question}
                        ---
                     `,
          instructionParams: {
            doc: {type: 'document', documentId: documentIdForAction},
          },
        })

        pushToast({
          title: 'Answer',
          description: (
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
                maxHeight: '50dvh',
                fontFamily: 'inherit',
              }}
            >
              {answer}
            </pre>
          ),
          status: 'info',
          closable: true,
          duration: Number.MAX_SAFE_INTEGER,
        })
      },
    })
  }, [actionType, getUserInput, client, documentIdForAction, pushToast])
}
