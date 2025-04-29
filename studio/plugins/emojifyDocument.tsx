import {
  ArrayOfPrimitivesInputProps,
  definePlugin,
  getDraftId,
  type InputProps,
  isArrayOfPrimitivesSchemaType,
  isArraySchemaType,
  isIndexSegment,
  isIndexTuple,
  isKeySegment,
  ObjectInputProps,
  Path,
  PathSegment,
  SchemaType,
  useClient as useClientSanity,
  useFormState,
  useFormValue,
  useWorkspace,
} from 'sanity'
import {useCallback, useMemo, useRef, useState} from 'react'
import {AgentActionPath, createClient} from '@sanity/client'
import {Box, Button, Flex, Spinner, Stack, useToast} from '@sanity/ui'
import {useDocumentPane} from 'sanity/desk'
import {SparklesIcon, WarningOutlineIcon} from '@sanity/icons'

export const emojifyDocPlugin = definePlugin({
  name: '@sanity/emojify-document',

  form: {
    components: {
      input: function Emojify(props: InputProps) {
        if (isType(props.schemaType, 'document') && props.id === 'root') {
          return <EmojifyDoc {...(props as ObjectInputProps)} />
        }
        return props.renderDefault(props)
      },
    },
  },
})

function EmojifyDoc(props: ObjectInputProps) {
  const {path, value} = props
  const workspaceName = useWorkspace().name
  const schemaId = `sanity.workspace.schema.${workspaceName}`
  const client = useClient({apiVersion: 'vX'})

  const [loading, setLoading] = useState(false)
  const {schemaType: documentSchemaType, documentId, value: documentValue} = useDocumentPane()
  const toast = useToast()

  const docValue = useRef(documentValue)
  docValue.current = documentValue

  const emojify = useCallback(() => {
    setLoading(true)
    const targetId = documentSchemaType.liveEdit ? documentId : getDraftId(documentId)

    async function runIt() {
      for (let i = 0; i < 10; i++) {
        await client.agent.action.transform({
          schemaId,
          documentId: targetId,
          instruction: `
           Add and replace emojis everywhere. Make it really crazy up in here!
           Make it very doggy. Insert random woofs and the like, as you se fit.
           You can also remove them, or rewrite to really give it BITE!
        `,
          conditionalPaths: {
            defaultHidden: false,
            defaultReadOnly: false,
          },
          temperature: 1,
        })
      }
    }

    runIt()
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
  }, [value, documentSchemaType, documentId, schemaId, client, path, toast])

  return (
    <Stack space={2} flex={1}>
      {props.renderDefault(props)}
      <Flex flex={1}>
        <Button
          text="Who let the dogs out?!"
          onClick={emojify}
          style={{width: '100%'}}
          mode="ghost"
          disabled={loading}
          icon={
            loading ? (
              <Box marginTop={1}>
                <Spinner />
              </Box>
            ) : (
              WarningOutlineIcon
            )
          }
          iconRight={
            loading ? (
              <Box marginTop={1}>
                <Spinner />
              </Box>
            ) : (
              WarningOutlineIcon
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
