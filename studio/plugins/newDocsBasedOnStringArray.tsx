import {
  ArrayOfPrimitivesInputProps,
  definePlugin,
  type InputProps,
  isArrayOfPrimitivesSchemaType,
  isArraySchemaType,
  isIndexSegment,
  isIndexTuple,
  isKeySegment,
  Path,
  PathSegment,
  SchemaType,
  useClient as useClientSanity,
  useWorkspace,
} from 'sanity'
import {useCallback, useMemo, useState} from 'react'
import {createClient} from '@sanity/client'
import {Box, Button, Flex, Spinner, Stack, useToast} from '@sanity/ui'
import {useDocumentPane} from 'sanity/desk'
import {SparklesIcon} from '@sanity/icons'

export const newDocumentsBasedOnStringArrayPlugin = definePlugin({
  name: '@sanity/new-based-on-string-array',

  form: {
    components: {
      input: function NewDocsArray(props: InputProps) {
        if (
          isArrayOfPrimitivesSchemaType(props.schemaType) &&
          props.schemaType.of[0].jsonType === 'string'
        ) {
          return <NewDocumentBasedOnStringArray {...(props as ArrayOfPrimitivesInputProps)} />
        }
        return props.renderDefault(props)
      },
    },
  },
})

function NewDocumentBasedOnStringArray(props: ArrayOfPrimitivesInputProps) {
  const {path, value, schemaType: fieldSchemaType} = props
  const workspaceName = useWorkspace().name
  const schemaId = `sanity.workspace.schema.${workspaceName}`
  const client = useClient({apiVersion: 'vX'})

  const [loading, setLoading] = useState(false)
  const {documentId, schemaType: documentSchemaType} = useDocumentPane()
  const toast = useToast()

  const generateMoreDocuments = useCallback(() => {
    setLoading(true)
    const tasks = ((value as string[]) ?? []).map((stringItem) => {
      return client.agent.action.generate({
        schemaId,
        targetDocument: {operation: 'create', _type: documentSchemaType.name},
        instruction: `
            We want to generate a document variation based on the current document.
            The new document should be based on a value from an alternation field title "${fieldSchemaType.title}"

            The document type is ${documentSchemaType.name}, and the document type title is ${documentSchemaType.title}
            ---

            The current document value is:
            $doc
            ---

            Generate a new document in full based on the following string (pulled from ${fieldSchemaType.title}):
            ${stringItem}
            ---

            Make the new document at least as big and have as much content as the original, but it must
            adhere to the alteration string.
            Keep it interesting.
          `,
        instructionParams: {
          doc: {type: 'document'},
        },
        conditionalPaths: {
          defaultHidden: false,
          defaultReadOnly: false,
        },
      })
    })

    Promise.all(tasks)
      .catch((err) => {
        console.error(err)
        toast.push({
          title: 'Operation failed',
          description: err.message,
          duration: 5000,
          closable: true,
        })
      })
      .finally(() => setLoading(false))
  }, [value, documentSchemaType, documentId, schemaId, client, path, toast, fieldSchemaType])

  return (
    <Stack space={2} flex={1}>
      {props.renderDefault(props)}
      <Flex flex={1}>
        <Button
          text="Generate alternate documents"
          onClick={generateMoreDocuments}
          style={{width: '100%'}}
          mode="ghost"
          disabled={loading}
          icon={
            loading ? (
              <Box marginTop={1}>
                <Spinner />
              </Box>
            ) : (
              SparklesIcon
            )
          }
        />
      </Flex>
    </Stack>
  )
}

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
