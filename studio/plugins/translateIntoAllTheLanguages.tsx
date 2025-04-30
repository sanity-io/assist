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
  useFormValue,
  useWorkspace,
} from 'sanity'
import {useCallback, useMemo, useState} from 'react'
import {AgentActionPath, createClient} from '@sanity/client'
import {Box, Button, Flex, Spinner, Stack, useToast} from '@sanity/ui'
import {useDocumentPane} from 'sanity/desk'
import {SparklesIcon} from '@sanity/icons'

export const languages = [
  {id: 'en', title: 'English'},
  {id: 'nb', title: 'Norwegian (Bokmål)'},
  {id: 'nn', title: 'Norwegian (Nynorsk)'},
  {id: 'de', title: 'German'},
  {id: 'he', title: 'Hebrew'},
  {id: 'ar', title: 'Arabic'},
]

//TODO make this plugin do the right thing wrgt doc-18n plugin (support doc update)
export const translateIntoAllLanguagesPlugin = definePlugin({
  name: '@sanity/translate-into-all-the-languages',

  form: {
    components: {
      input: function MakeTranslations(props: InputProps) {
        if (isType(props.schemaType, 'document') && props.id === 'root') {
          return <TranslateIntoAllLanguages {...(props as ObjectInputProps)} />
        }
        return props.renderDefault(props)
      },
    },
  },
})

function TranslateIntoAllLanguages(props: ObjectInputProps) {
  const {path, value} = props
  const workspaceName = useWorkspace().name
  const schemaId = `sanity.workspace.schema.${workspaceName}`
  const client = useClient({apiVersion: 'vX'})

  const [loading, setLoading] = useState(false)
  const {schemaType: documentSchemaType} = useDocumentPane()
  const toast = useToast()

  const documentId = useFormValue(['_id']) as string

  const languageCode = (useFormValue(['language']) as string | undefined) ?? languages[0].id

  const translateAllTheLangauges = useCallback(() => {
    if (!languageCode) return

    const fromLanguage = languages.find((lang) => lang.id === languageCode)
    if (!fromLanguage) return

    setLoading(true)

    const tasks = languages
      .filter((lang) => lang.id !== languageCode)
      .map((lang) => {
        return client.agent.action.translate({
          schemaId,
          documentId,
          targetDocument: {operation: 'create'},
          fromLanguage,
          toLanguage: lang,
          languageFieldPath: 'language',
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
  }, [value, documentSchemaType, documentId, schemaId, client, path, toast, languages])

  return (
    <Stack space={2} flex={1}>
      <Flex flex={1}>
        <Button
          text="Create translations"
          onClick={translateAllTheLangauges}
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
      {props.renderDefault(props)}
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
