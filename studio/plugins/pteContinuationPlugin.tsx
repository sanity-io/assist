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
  pathToString,
  SchemaType,
  useClient as useClientSanity,
  useWorkspace,
} from 'sanity'
import {useDocumentPane} from 'sanity/desk'
import {useCallback, useEffect, useMemo, useRef} from 'react'
import {AgentActionPath, createClient} from '@sanity/client'
import {useToast} from '@sanity/ui'
import {PortableTextBlock} from '@portabletext/types'
import {outdent} from 'outdent'

//TODO move cursor to after whatever is generated

// Triggers on mod+mod+.
export const pteContinuationPlugin = definePlugin({
  name: '@sanity/pte-continuation',

  form: {
    components: {
      input: function PteContinuation(props: InputProps) {
        const {path, schemaType: fieldSchemaType, value} = props
        const client = useClient({apiVersion: 'vX'})
        const {
          documentId,
          schemaType: documentSchemaType,
          value: documentValue,
          focusPath,
        } = useDocumentPane()

        const fieldValue = useRef(value)
        fieldValue.current = value

        const docRef = useRef(documentValue)
        docRef.current = documentValue

        const focusPathRef = useRef(focusPath)
        focusPathRef.current = focusPath

        const workspaceName = useWorkspace().name
        const schemaId = `sanity.workspace.schema.${workspaceName}`

        const toast = useToast()

        const focused = useMemo(() => {
          // this plugin only consideres pte fields focused, so other fields will not have the key handler
          return (
            getPortableTextBlock(fieldSchemaType) &&
            !!(focusPath.length && path.length && pathStartsWith(focusPath, path))
          )
        }, [path, focusPath, fieldSchemaType])

        const createContinuation = useCallback(
          (event: KeyboardEvent) => {
            const isModPressed = event.metaKey || event.ctrlKey

            if (!(isModPressed && event.key === '.')) return false

            const fieldPath = path as AgentActionPath
            const targetId = documentSchemaType.liveEdit ? documentId : getDraftId(documentId)

            const blockType = getPortableTextBlock(fieldSchemaType)
            let blockKey: string | undefined
            if (!(focusPathRef.current && blockType)) return

            const [text, childSegment, children, blockSegment] = [...focusPathRef.current].reverse()
            if (
              !(
                childSegment &&
                isKeySegment(childSegment) &&
                blockSegment &&
                isKeySegment(blockSegment)
              )
            ) {
              return
            }

            const pteValue = Array.isArray(fieldValue.current)
              ? fieldValue.current
              : // need a placerhold value
                [
                  {
                    _key: blockSegment._key,
                    _type: blockType.name,
                    children: [{_key: childSegment._key, _type: 'span', text: ''}],
                  } satisfies PortableTextBlock,
                ]

            const index = pteValue?.findIndex(
              (b: PortableTextBlock) => b._key === blockSegment._key,
            )
            const blockValue = pteValue?.[index] as PortableTextBlock
            if (!blockValue) {
              return
            }
            const blocksBefore = pteValue.splice(0, index).filter((b) => b._type == blockType.name)
            const blocksAfter = pteValue
              .splice(index + 1, index)
              .filter((b) => b._type == blockType.name)

            blockKey = blockValue._key

            const blockText = (block: PortableTextBlock) =>
              block?.children
                ?.filter((c) => c._type === 'span')
                .map((c) => c.text)
                .join('') ?? '<br>'

            client.agent.action
              .generate({
                schemaId,
                targetDocument: {
                  operation: 'createIfNotExists',
                  _id: targetId,
                  _type: documentSchemaType.name,
                  initialValues: docRef.current,
                },
                //poor mans continuation
                instruction: outdent`
                  We want to generate the next paragraph or title inside the text value for a field, after the current cursor.

                  The document value is:
                  $doc
                  ---

                  We are in the following field:
                  JSON-path: ${pathToString(path)}
                  Title: ${fieldSchemaType.title}

                  Before the current cursor line, we have this text:
                  ${blocksBefore?.map(blockText).join('\n\n')}
                  ---

                  The current line is:
                  ${blockText(blockValue)}
                  ---

                  After the current cursor line, we have this text:
                  ${blocksAfter?.map(blockText).join('\n\n')}
                  ---

                  Remember, the current paragraph is:
                  ${blockText(blockValue)}
                  ---

                  Generate the next sentence, line, paragraph or title for the text.
                  The continuation should make makes sense in context, and fit well after the current line.
                  Consider the field title and the existing content.
                  Keep it interesting.
                `,
                instructionParams: {
                  doc: {type: 'document'},
                  field: {type: 'field', path: fieldPath},
                },
                target: {
                  path: fieldPath,
                  operation: 'append',
                  // only generate text when inside PTE
                  include:
                    blockKey && fieldValue.current
                      ? [{path: {_key: blockKey}, operation: 'append'}]
                      : undefined,
                  types: blockType ? {include: [blockType.name]} : undefined,
                },
                conditionalPaths: {
                  defaultHidden: false,
                  defaultReadOnly: false,
                },
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
          [path, client, schemaId, fieldSchemaType, documentSchemaType, documentId, toast],
        )

        useEffect(() => {
          if (!focused) return
          window.addEventListener('keydown', createContinuation, {capture: true})
          return () => window.removeEventListener('keydown', createContinuation, {capture: true})
        }, [createContinuation, focused])

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
