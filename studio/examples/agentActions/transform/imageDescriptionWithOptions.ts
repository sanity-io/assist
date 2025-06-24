/* eslint-disable @typescript-eslint/no-empty-interface */
import {
  type AssistFieldActionProps,
  defineAssistFieldAction,
  isType,
  useUserInput,
} from '@sanity/assist'
import {useMemo} from 'react'
import {ClipboardImageIcon} from '@sanity/icons'
import {isArrayOfObjectsSchemaType, SchemaType, useClient} from 'sanity'
import {useToast} from '@sanity/ui'
import {type AgentActionPath} from '@sanity/client'

interface ImageDescriptionWithOptions {
  addImageDescriptionAction?: true | AgentActionPath
}

/**
 * [Interface declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) that adds
 * `options.imageDescription` to all string, text and array fields.
 */
declare module 'sanity' {
  interface StringOptions extends ImageDescriptionWithOptions {}
  interface TextOptions extends ImageDescriptionWithOptions {}
  interface ArrayOptions extends ImageDescriptionWithOptions {}
}

/**
 * This examples show how a Sanity schema can be extended with new options, and use the new options to attach a image description action.
 *
 * This action will be added to any string, text or portable text field with `options.addImageDescriptionAction`, where
 * `addImageDescriptionAction?: true | Path`.
 *
 * When `imageDescription` is:
 * - `true`, the field must be field nested under an `image` field.
 * - `Path`, this must be the path to an image object in the same document
 *
 * Examples:
 *
 * ```ts
 * defineField({
 *   type: 'image',
 *   name: 'image',
 *   fields: [
 *      defineField({
 *        type: 'string',
 *        name: 'altText',
 *        options: { addImageDescriptionAction: true }
 *      })
 *   ]
 * })
 * ```
 *
 * ```ts
 *  defineField({
 *   type: 'string',
 *   name: 'description',
 *   options: { addImageDescriptionAction: ['path', 'to', 'image'] }
 * })
 * ```
 *
 * Modify the instruction as needed.
 *
 * ### Usage
 * ```ts
 * import {useMemo} from 'react'
 * import {type AssistFieldActionProps} from '@sanity/assist'
 * import {useImageDescriptionWithOptions} from './transform/useImageDescriptionWithOptions'
 *
 * function useFieldActions(props: AssistFieldActionProps) {
 *   const imageDescriptionWithOptions = useImageDescriptionWithOptions(props)
 *   return useMemo(() => [imageDescriptionWithOptions], [imageDescriptionWithOptions])
 * }
 * ```
 */
export function useImageDescriptionWithOptions(props: AssistFieldActionProps) {
  const {documentIdForAction, getConditionalPaths, path, schemaId, schemaType} = props

  const client = useClient({apiVersion: 'vX'})
  const getUserInput = useUserInput()
  const {push: pushToast} = useToast()

  return useMemo(() => {
    const isSupportedType =
      isType(schemaType, 'string') || isType(schemaType, 'text') || isPortableTextArray(schemaType)
    if (!isSupportedType) {
      return undefined
    }

    const options = schemaType.options as ImageDescriptionWithOptions | undefined
    if (!options?.addImageDescriptionAction) {
      return undefined
    }

    return defineAssistFieldAction({
      title: 'Describe image',
      icon: ClipboardImageIcon,
      onAction: async () => {
        await client.agent.action.transform({
          schemaId,
          documentId: documentIdForAction,
          instruction: 'Describe the image for someone who cannot see it',
          target: {
            operation: {
              type: 'image-description',
              sourcePath: Array.isArray(options.addImageDescriptionAction)
                ? options.addImageDescriptionAction
                : undefined,
            },
            path,
          },
          conditionalPaths: {paths: getConditionalPaths()},
        })
      },
    })
  }, [
    client,
    documentIdForAction,
    getConditionalPaths,
    path,
    schemaId,
    schemaType,
    getUserInput,
    pushToast,
  ])
}

export function isPortableTextArray(type: SchemaType) {
  return isArrayOfObjectsSchemaType(type) && type.of.some((t) => isType(t, 'block'))
}
