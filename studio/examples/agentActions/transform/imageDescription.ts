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

interface ImageDescriptionOptions {
  imageDescription?: true | AgentActionPath | 'remote'
}

/**
 * [Interface declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) that adds
 * `options.imageDescription` to all string ,text and array fields.
 */
declare module 'sanity' {
  interface StringOptions extends ImageDescriptionOptions {}
  interface TextOptions extends ImageDescriptionOptions {}
  interface ArrayOptions extends ImageDescriptionOptions {}
}

/**
 * This action will be added to any string, text or portable text field with `options.imageDescription`, where
 * `imageDescription?: true | Path | 'remote'`.
 *
 * When `imageDescription` is:
 * - `true`, the field must be field nested under an `image` field.
 * - `Path`, this must be the path to an image object in the same document
 * - `'remote'`, the user will be asked via a input dialog to provide an image url
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
 *        options: { imageDescription: true }
 *      })
 *   ]
 * })
 * ```
 *
 * ```ts
 *  defineField({
 *   type: 'string',
 *   name: 'description',
 *   options: { imageDescription: ['path', 'to', 'image'] }
 * })
 * ```
 *
 * ```ts
 *  defineField({
 *   type: 'string',
 *   name: 'description',
 *   options: { imageDescription: 'remote' }
 * })
 * ```
 *
 * Modify the instruction as needed.
 *
 * ### Usage
 * ```ts
 * import {useMemo} from 'react'
 * import {type AssistFieldActionProps} from '@sanity/assist'
 * import {useImageDescription} from './transform/useImageDescription'
 *
 * function useFieldActions(props: AssistFieldActionProps) {
 *   const imageDescriptionAction = useImageDescription(props)
 *   return useMemo(() => [imageDescriptionAction], [imageDescriptionAction])
 * }
 * ```
 */
export function useImageDescription(props: AssistFieldActionProps) {
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

    const options = schemaType.options as ImageDescriptionOptions | undefined
    if (!options?.imageDescription) {
      return undefined
    }

    return defineAssistFieldAction({
      title: options.imageDescription === 'remote' ? 'Describe image...' : 'Describe image',
      icon: ClipboardImageIcon,
      onAction: async () => {
        let imageUrl: `https://${string}` | undefined

        if (options.imageDescription === 'remote') {
          const userInput = await getUserInput({
            title: 'Describe image on URL',
            inputs: [
              {
                id: 'image-url',
                title: 'Image URL',
                description: 'Paste your image url here (needs to start with https://)',
              },
            ],
          })

          if (!userInput) {
            return undefined // user closed the dialog
          }

          const [{result}] = userInput
          if (!isValidUrl(result)) {
            pushToast({
              title: 'Invalid URL',
              description: `"${result}" is not a valid URL. It needs to start with https://`,
              status: 'error',
            })
            return
          }
          imageUrl = result
        }

        await client.agent.action.transform({
          schemaId,
          documentId: documentIdForAction,
          instruction: 'Describe the image for someone who cannot see it',
          target: {
            operation:
              options.imageDescription === 'remote'
                ? {type: 'image-description', imageUrl}
                : {
                    type: 'image-description',
                    sourcePath: Array.isArray(options.imageDescription)
                      ? options.imageDescription
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

function isValidUrl(url: string): url is `https://${string}` {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}
