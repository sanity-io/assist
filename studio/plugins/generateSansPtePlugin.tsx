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

//TODO move cursor to after whatever is generated

// Triggers on mod+mod+.
export const generateSansPtePlugin = definePlugin({
  name: '@sanity/generate-sans-pte',

  form: {
    components: {
      input: function GenerateSansPte(props: InputProps) {
        const {path, schemaType: fieldSchemaType, focused: componentFocused, value} = props
        const client = useClient({apiVersion: 'vX'})
        const {documentId, schemaType: documentSchemaType, value: documentValue} = useDocumentPane()

        const docValue = useRef(documentValue)
        docValue.current = documentValue

        const workspaceName = useWorkspace().name
        const schemaId = `sanity.workspace.schema.${workspaceName}`

        const toast = useToast()

        const focused = useMemo(() => {
          // if we are in a PTE field, consider it never focused, so the plugin will never trigger
          if (getPortableTextBlock(fieldSchemaType)) return false
          return componentFocused
        }, [fieldSchemaType, componentFocused])

        const generate = useCallback(
          (event: KeyboardEvent) => {
            const isModPressed = event.metaKey || event.ctrlKey

            if (!(isModPressed && event.key === '.')) {
              return false
            }

            const fieldPath = path as AgentActionPath
            const targetId = documentSchemaType.liveEdit ? documentId : getDraftId(documentId)

            client.agent.action
              .generate({
                schemaId,
                targetDocument: {
                  operation: 'createIfNotExists',
                  _id: targetId,
                  _type: documentSchemaType.name,
                  initialValues: docValue.current,
                },
                instruction: `
                  We are generating a new value for a document field.
                  The document type is ${documentSchemaType.name}, and the document type title is ${documentSchemaType.title}

                  The document value is:
                  $doc
                  ---

                  We are in the following field:
                  JSON-path: ${pathToString(path)}
                  Title: ${fieldSchemaType.title}
                  Value: $field (consider it empty if undefined)
                  ---

                  Generate a new field value. The new value should be relevant to the document type and context.
                  Keep it interesting.
                `,
                instructionParams: {
                  doc: {type: 'document'},
                  field: {type: 'field', path: fieldPath},
                },
                target: {path: fieldPath},
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
          window.addEventListener('keydown', generate, {capture: true})
          return () => window.removeEventListener('keydown', generate, {capture: true})
        }, [generate, focused])

        return props.renderDefault(props)
      },
    },
  },
})

export function useClient(props: {apiVersion: string}) {
  const client = useClientSanity(props)
  return useMemo(() => {
    return createClient(client.config()).withConfig({
      apiHost: 'http://localhost:5000',
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
