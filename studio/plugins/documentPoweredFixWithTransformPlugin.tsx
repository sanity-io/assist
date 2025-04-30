import {
  definePlugin,
  getDraftId,
  type InputProps,
  isArraySchemaType,
  isIndexSegment,
  isIndexTuple,
  isKeySegment,
  Path,
  PathSegment,
  SchemaType,
  useClient as useClientSanity,
  useFormValue,
  useWorkspace,
} from 'sanity'
import {useDocumentPane} from 'sanity/desk'
import {useCallback, useEffect, useMemo, useRef} from 'react'
import {AgentActionPath, createClient} from '@sanity/client'
import {useToast} from '@sanity/ui'
import {outdent} from 'outdent'

// Triggers on shift+mod+enter
export const documentPoweredFixWithTransformPlugin = definePlugin({
  name: '@sanity/document-powered-spelling',

  form: {
    components: {
      input: function FixSpelling(props: InputProps) {
        const {path, schemaType: fieldSchemaType, focused: componentFocused} = props
        const client = useClient({apiVersion: 'vX'})
        const {
          documentId,
          schemaType: documentSchemaType,
          value: documentValue,
          focusPath,
        } = useDocumentPane()

        const docValue = useRef(documentValue)
        docValue.current = documentValue

        const workspaceName = useWorkspace().name
        const schemaId = `sanity.workspace.schema.${workspaceName}`

        const toast = useToast()

        const languageCode = (useFormValue(['language']) as string | undefined) ?? 'en-US'

        const focused = useMemo(() => {
          return (
            componentFocused ||
            (getPortableTextBlock(fieldSchemaType) &&
              !!(focusPath.length && path.length && pathStartsWith(focusPath, path)))
          )
        }, [path, focusPath, fieldSchemaType, componentFocused])

        const fixSpelling = useCallback(
          (event: KeyboardEvent) => {
            const isModPressed = event.metaKey || event.ctrlKey

            if (!(event.shiftKey && isModPressed && event.key === 'Enter')) {
              return false
            }

            const fieldPath = path as AgentActionPath
            const targetId = documentSchemaType.liveEdit ? documentId : getDraftId(documentId)

            client.agent.action
              .transform({
                schemaId,
                documentId: targetId,
                instruction: outdent`
                Fix the field value according to this guide:
                $guide.
                ---
                Keep in mind that the document is for language code: ${languageCode}
                `,
                instructionParams: {
                  guide: {
                    type: 'groq',
                    //this is silly, you should use a singleton id probably
                    query: '*[_type == $type] | order(_updatedAt desc)[0].context',
                    params: {type: 'assist.instruction.context'},
                  },
                },
                target: fieldPath?.length ? {path: fieldPath} : undefined,
                conditionalPaths: {
                  defaultHidden: false,
                  defaultReadOnly: false,
                },
                temperature: 0.4,
              })
              .catch((err) => {
                console.error(err)
                toast.push({
                  title: 'Operation failed',
                  description: err.message,
                  duration: 5000,
                  closable: true,
                })
              })

            event.stopPropagation()
            event.preventDefault()
            return true
          },
          [path, client, schemaId, documentSchemaType, documentId, toast, languageCode],
        )

        useEffect(() => {
          if (!focused) return
          window.addEventListener('keydown', fixSpelling, {capture: true})
          return () => window.removeEventListener('keydown', fixSpelling, {capture: true})
        }, [fixSpelling, focused])

        return props.renderDefault(props)
      },
    },
  },
})

export function useClient(props: {apiVersion: string}) {
  const client = useClientSanity(props)
  return useMemo(() => {
    const sanityClient = createClient(client.config())
    if (!process.env.SANITY_STUDIO_PLUGIN_API_HOST) {
      return sanityClient
    }
    return sanityClient.withConfig({
      apiHost: process.env.SANITY_STUDIO_PLUGIN_API_HOST,
      useProjectHostname: false,
      withCredentials: false,
    })
  }, [client])
}

export function pathStartsWith(path: Path, startsWithPath: Path) {
  return startsWithPath.every((s, i) => isSegmentEqual(s, path[i]))
}

export function isSegmentEqual(segmentA: PathSegment, segmentB: PathSegment): boolean {
  if (isKeySegment(segmentA) && isKeySegment(segmentB)) return segmentA._key === segmentB._key
  if (isIndexSegment(segmentA)) return Number(segmentA) === Number(segmentB)
  if (isIndexTuple(segmentA) && isIndexTuple(segmentB)) {
    return segmentA[0] === segmentB[0] && segmentA[1] === segmentB[1]
  }
  return segmentA === segmentB
}

export function getPortableTextBlock(type: SchemaType) {
  if (!isArraySchemaType(type)) return undefined
  return type.of.find((t) => isType(t, 'block'))
}

export function isType(schemaType: SchemaType, typeName: string): boolean {
  if (schemaType.name === typeName) return true
  if (!schemaType.type) return false
  return isType(schemaType.type, typeName)
}
