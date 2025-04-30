import {
  definePlugin,
  getDraftId,
  type InputProps,
  isArraySchemaType,
  pathToString,
  SchemaType,
  useClient as useClientSanity,
  useWorkspace,
} from 'sanity'
import {useDocumentPane} from 'sanity/desk'
import {useCallback, useEffect, useMemo, useRef} from 'react'
import {AgentActionPath, createClient} from '@sanity/client'
import {useToast} from '@sanity/ui'
import {outdent} from 'outdent'

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
                instruction: outdent`
                  We are generating a new value for a document field.
                  The document type is ${documentSchemaType.name}, and the document type title is ${documentSchemaType.title}

                  The document language is: "$lang" (use en-US if unspecified)

                  The document value is:
                  $doc
                  ---

                  We are in the following field:
                  JSON-path: ${pathToString(path)}
                  Title: ${fieldSchemaType.title}
                  Value: $field (consider it empty if undefined)
                  ---

                  Generate a new field value. The new value should be relevant to the document type and context.
                  Keep it interesting. Generate using the document language.
                `,
                instructionParams: {
                  doc: {type: 'document'},
                  field: {type: 'field', path: fieldPath},
                  lang: {type: 'field', path: ['language']},
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

export function getPortableTextBlock(type: SchemaType) {
  if (!isArraySchemaType(type)) return undefined
  return type.of.find((t) => isType(t, 'block'))
}

export function isType(schemaType: SchemaType, typeName: string): boolean {
  if (schemaType.name === typeName) return true
  if (!schemaType.type) return false
  return isType(schemaType.type, typeName)
}
