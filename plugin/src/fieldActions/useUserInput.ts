import {useRunInstruction} from '../assistLayout/RunInstructionProvider'

export type GetUserInput = (args: {
  /**
   * Dialog title
   */
  title: string
  /**
   * One titled input per array item
   */
  inputs: CustomInput[]
}) => Promise<CustomInputResult[] | undefined>

/**
 *
 */
export interface CustomInput {
  /**
   * Id for the input
   */
  id: string
  /**
   * Title of the input field
   */
  title: string
  /**
   * Additional info that will be displayed over the input
   */
  description?: string
}

export type CustomInputResult = {
  /**
   * Identifies which custom input the `result`belongs to
   */
  input: CustomInput

  /**
   * The text provided by the user in the input
   */
  result: string
}

/**
 * `useUserInput` returns a function that can be used to await user input.
 *
 * Useful for custom `fieldActions` to get user input for populating Agent Action requests,.
 *
 * ```ts
 *  fieldActions: {
 *   useFieldActions: (props) => {
 *     const {
 *       documentSchemaType,
 *       schemaId,
 *       getDocumentValue,
 *       getConditionalPaths,
 *       documentIdForAction,
 *     } = props
 *     const client = useClient({apiVersion: 'vX'})
 *     const getUserInput = useUserInput()
 *     return useMemo(() => {
 *       return [
 *         defineAssistFieldAction({
 *           title: 'Log user input',
 *           icon: UserIcon,
 *           onAction: async () => {
 *             const input = await getUserInput({
 *               title: 'Topic',
 *               inputs: [{id: 'about', title: 'What should the article be about?'}],
 *             })
 *             if (!input) return // user canceled input
 *             await client.agent.action.generate({
 *               schemaId,
 *               targetDocument: {
 *                 operation: 'createIfNotExists',
 *                 _id: documentIdForAction,
 *                 _type: documentSchemaType.name,
 *                 initialValues: getDocumentValue(),
 *               },
 *               instruction: `
 *                   Create a document about the following topic:
 *                   $about
 *                   ---
 *                `,
 *               instructionParams: {about: input[0].result},
 *               conditionalPaths: {paths: getConditionalPaths()},
 *             })
 *           },
 *         }),
 *       ]
 *     }, [
 *       client,
 *       documentSchemaType,
 *       schemaId,
 *       getDocumentValue,
 *       getConditionalPaths,
 *       documentIdForAction,
 *       getUserInput,
 *     ])
 *   },
 * }
 * ```
 */
export function useUserInput(): GetUserInput {
  const {getUserInput} = useRunInstruction()
  return getUserInput
}
