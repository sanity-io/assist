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

/**
 * This action will be added to any string, text or portable text field containing the word 'alt' or 'description',
 * that is a direct child field of an image object.
 *
 * Example:
 *
 * ```ts
 * defineField({
 *   type: 'image',
 *   name: 'image',
 *   fields: [
 *      defineField({
 *        type: 'string',
 *        name: 'altText',
 *      })
 *   ]
 * })
 * ```
 *
 * Modify the instruction and field matching as needed.
 *
 * ### Usage
 * ```ts
 * import {useMemo} from 'react'
 * import {type AssistFieldActionProps} from '@sanity/assist'
 * import {useImageDescriptionWithFieldNames} from './transform/useImageDescriptionWithFieldNames'
 *
 * function useFieldActions(props: AssistFieldActionProps) {
 *   const imageDescriptionWithFieldNames = useImageDescriptionWithFieldNames(props)
 *   return useMemo(() => [imageDescriptionWithFieldNames], [imageDescriptionWithFieldNames])
 * }
 * ```
 */
export function useImageDescriptionWithFieldNames(props: AssistFieldActionProps) {
  const {documentIdForAction, getConditionalPaths, path, schemaId, schemaType, parentSchemaType} =
    props

  const client = useClient({apiVersion: 'vX'})
  const getUserInput = useUserInput()
  const {push: pushToast} = useToast()

  return useMemo(() => {
    const isSupportedOutputType =
      isType(schemaType, 'string') || isType(schemaType, 'text') || isPortableTextArray(schemaType)

    if (!parentSchemaType || !isType(parentSchemaType, 'image') || !isSupportedOutputType) {
      return undefined
    }

    const lastSegment = path.slice(-1)[0]
    if (
      typeof lastSegment !== 'string' ||
      !['alt', 'description'].some((contains) => lastSegment.toLowerCase().includes(contains))
    ) {
      return undefined
    }

    return defineAssistFieldAction({
      title: 'Generate image description',
      icon: ClipboardImageIcon,
      onAction: async () => {
        await client.agent.action.transform({
          schemaId,
          documentId: documentIdForAction,
          instruction: 'Describe the image for someone who cannot see it',
          target: {
            operation: {type: 'image-description'},
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
    parentSchemaType,
  ])
}

export function isPortableTextArray(type: SchemaType) {
  return isArrayOfObjectsSchemaType(type) && type.of.some((t) => isType(t, 'block'))
}
