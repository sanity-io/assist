import {type AssistFieldActionProps, defineAssistFieldAction, useUserInput} from '@sanity/assist'
import {useMemo} from 'react'
import {TranslateIcon} from '@sanity/icons'
import {pathToString, useClient} from 'sanity'
import {useToast} from '@sanity/ui'
import {useAutoFillFieldAction} from '../generate/autoFill'

/**
 * This action takes user input and infers which action to call.
 *
 * Modify the instruction and supported actions as needed.
 *
 * ### Usage
 * ```ts
 * import {useMemo} from 'react'
 * import {type AssistFieldActionProps} from '@sanity/assist'
 * import {useInferAction} from './prompt/useInferAction'
 *
 * function useFieldActions(props: AssistFieldActionProps) {
 *   const useInferAction = useInferAction(props)
 *   return useMemo(() => [inferAction], [inferAction])
 * }
 * ```
 * @param props
 */
export function useInferAction(props: AssistFieldActionProps) {
  const {actionType, documentIdForAction, getConditionalPaths, path, schemaId, schemaType} = props

  const client = useClient({apiVersion: 'vX'})
  const getUserInput = useUserInput()
  const {push: pushToast} = useToast()

  const autoFill = useAutoFillFieldAction(props)

  return useMemo(() => {
    if (actionType !== 'field') {
      return undefined
    }
    return defineAssistFieldAction({
      title: 'Infer action...',
      icon: TranslateIcon,
      onAction: async () => {
        const userInput = await getUserInput({
          title: 'Instruction',
          inputs: [
            {
              id: 'instruction',
              title: 'Instruction',
              description: 'What do you want to do?',
            },
          ],
        })

        if (!userInput) {
          return undefined // user closed the dialog
        }

        const [{result: instruction}] = userInput

        pushToast({
          title: 'Inferring action...',
          status: 'info',
          duration: 2000,
        })

        const inferredAction = (await client.agent.action.prompt({
          instruction: `
                        Given the following document:
                        $doc
                        ---
                        The user has invoked an instruction in the following field:
                        JSON-path: ${pathToString(path)}
                        Title: ${schemaType.title}
                        ---
                        The user instruction is as follows:
                        ${instruction}
                        ---
                        The user instruction should map to either of these actions:
                        - Generate: contextually generate content for the current field
                        - Transform text: change the text in the current field, based on the instruction
                        - Transform image: change an image, based on the instruction

                        Infer what the user wants, and answer with one of the following JSON object (and nothing else):
                        {
                          action: 'generate' | 'transform-text' | 'transform-image',
                          intent: string /* any details that that seems relevant for the for the actions, based on the user instruction */
                        }
                     `,
          instructionParams: {
            doc: {type: 'document', documentId: documentIdForAction},
          },
          format: 'json' as const,
        })) as {
          action?: 'generate' | 'transform-text' | 'transform-image' | string
          intent?: string
        }

        console.log(inferredAction)

        switch (inferredAction.action) {
          case 'generate':
            await autoFill.onAction()
            return
          case 'transform-text':
            await client.agent.action.transform({
              schemaId,
              documentId: documentIdForAction,
              instruction: [
                'Transform the field according to the following instruction:',
                inferredAction.intent,
                '---',
              ].join('\n'),
              target: {path},
              conditionalPaths: {paths: getConditionalPaths()},
            })
            return
          case 'transform-image':
            await client.agent.action.transform({
              schemaId,
              documentId: documentIdForAction,
              instruction: [
                'Transform the image according to the following instruction:',
                inferredAction.intent,
                '---',
              ].join('\n'),
              target: {path: [...path, 'asset']},
              conditionalPaths: {paths: getConditionalPaths()},
            })
            return
          default:
            console.warn('Unknown intent', inferredAction)
            pushToast({
              title: 'Unable to determine intent',
              status: 'warning',
              duration: 3000,
            })
        }
      },
    })
  }, [
    client,
    documentIdForAction,
    getConditionalPaths,
    path,
    schemaId,
    getUserInput,
    autoFill,
    actionType,
    pushToast,
    schemaType,
  ])
}
