import {
  definePlugin,
  getDraftId,
  type InputProps,
  ObjectInputProps,
  SchemaType,
  useClient as useClientSanity,
  useWorkspace,
} from 'sanity'
import {useCallback, useMemo, useRef, useState} from 'react'
import {createClient} from '@sanity/client'
import {Box, Button, Flex, Spinner, Stack, useToast} from '@sanity/ui'
import {useDocumentPane} from 'sanity/desk'
import {WarningOutlineIcon} from '@sanity/icons'
import {outdent} from 'outdent'

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
          instruction: outdent`
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

export function isType(schemaType: SchemaType, typeName: string): boolean {
  if (schemaType.name === typeName) return true
  if (!schemaType.type) return false
  return isType(schemaType.type, typeName)
}
