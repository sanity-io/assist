import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react'
import {ObjectSchemaType, SanityDocumentLike, useClient} from 'sanity'
import {useAiAssistanceConfig} from '../assistLayout/AiAssistanceConfigContext'
import {useApiClient, useTranslate} from '../useApiClient'
import {Box, Button, Checkbox, Dialog, Flex, Radio, Spinner, Stack, Text, Tooltip} from '@sanity/ui'
import {
  defaultLanguageOutputs,
  getDocumentMembersFlat,
  getTranslationMap,
  TranslationMap,
} from './paths'
import {PlayIcon} from '@sanity/icons'
import {Language} from './types'
import {getLanguageParams} from './getLanguageParams'

export interface FieldTranslationContextValue {
  openFieldTranslation: (document: SanityDocumentLike, documentSchema: ObjectSchemaType) => void
  translationLoading: boolean
}

export const FieldTranslationContext = createContext<FieldTranslationContextValue>({
  openFieldTranslation: () => {},
  translationLoading: false,
})

export function useFieldTranslation() {
  return useContext(FieldTranslationContext)
}

export function FieldTranslationProvider(props: PropsWithChildren<{}>) {
  const {config: assistConfig} = useAiAssistanceConfig()
  const apiClient = useApiClient(assistConfig.__customApiClient)
  const config = assistConfig.translate?.field
  const {translate: runTranslate} = useTranslate(apiClient)

  const [dialogOpen, setDialogOpen] = useState(false)

  const [document, setDocument] = useState<SanityDocumentLike | undefined>()
  const [documentSchema, setDocumentSchema] = useState<ObjectSchemaType | undefined>()
  const [languages, setLanguages] = useState<Language[] | undefined>()
  const [fromLanguage, setFromLanguage] = useState<Language | undefined>(undefined)
  const [toLanguages, setToLanguages] = useState<Language[] | undefined>(undefined)
  const [translationMap, setTranslationMap] = useState<TranslationMap[] | undefined>()

  const close = useCallback(() => {
    setDialogOpen(false)
    setLanguages(undefined)
    setDocument(undefined)
    setDocument(undefined)
  }, [])
  const languageClient = useClient({apiVersion: config?.apiVersion ?? '2022-11-27'})
  const documentId = document?._id
  const id = useId()

  const selectFromLanguage = useCallback(
    (
      from: Language,
      languages: Language[] | undefined,
      document: SanityDocumentLike | undefined,
      documentSchema: ObjectSchemaType | undefined
    ) => {
      setFromLanguage(from)
      if (!document || !documentSchema || !languages) {
        setTranslationMap(undefined)
        return
      }

      const to = languages.filter((l) => l.id !== from?.id)
      setToLanguages(to)
      const fromId = from?.id
      const toIds = to?.map((l) => l.id) ?? []
      const docMembers = getDocumentMembersFlat(document, documentSchema)
      if (fromId && toIds?.length) {
        const transMap = getTranslationMap(
          documentSchema,
          docMembers,
          fromId,
          toIds,
          config?.translationOutputs ?? defaultLanguageOutputs
        )
        setTranslationMap(transMap)
      } else {
        setTranslationMap(undefined)
      }
    },
    [config]
  )

  const toggleToLanguage = useCallback(
    (
      toggledLang: Language,
      toLanguages: Language[] | undefined,
      languages: Language[] | undefined
    ) => {
      if (!languages) {
        return
      }
      const wasSelected = !!toLanguages?.find((l) => l.id === toggledLang.id)
      const newToLangs = languages.filter(
        (anyLang) =>
          !!toLanguages?.find(
            (selectedLang) => toggledLang.id !== selectedLang.id && selectedLang.id === anyLang.id
          ) ||
          (toggledLang.id === anyLang.id && !wasSelected)
      )
      setToLanguages(newToLangs)
    },
    []
  )

  const contextValue: FieldTranslationContextValue = useMemo(() => {
    return {
      openFieldTranslation: async (
        document: SanityDocumentLike,
        documentSchema: ObjectSchemaType
      ) => {
        setDialogOpen(true)
        const languageParams = getLanguageParams(config?.selectLanguageParams, document)
        const languages: Language[] | undefined = await (typeof config?.languages === 'function'
          ? config?.languages(languageClient, languageParams)
          : Promise.resolve(config?.languages))
        setLanguages(languages)
        setDocument(document)
        setDocumentSchema(documentSchema)
        const fromLanguage = languages?.[0]
        if (fromLanguage) {
          selectFromLanguage(fromLanguage, languages, document, documentSchema)
        } else {
          console.error('No languages available for selected language params', languageParams)
        }
      },
      translationLoading: false,
    }
  }, [selectFromLanguage, config, languageClient])

  const runDisabled =
    !fromLanguage || !toLanguages?.length || !translationMap?.length || !documentId

  const onRunTranslation = useCallback(() => {
    if (translationMap && documentId) {
      runTranslate({
        documentId,
        fieldLanguageMap: translationMap.map((map) => ({
          ...map,
          // eslint-disable-next-line max-nested-callbacks
          outputs: map.outputs.filter((out) => !!toLanguages?.find((l) => l.id === out.id)),
        })),
      })
    }
    close()
  }, [translationMap, documentId, runTranslate, close, toLanguages])

  const runButton = (
    <Button
      text={`Translate`}
      tone="primary"
      icon={PlayIcon}
      style={{width: '100%'}}
      disabled={runDisabled}
      onClick={onRunTranslation}
    />
  )

  return (
    <FieldTranslationContext.Provider value={contextValue}>
      {dialogOpen ? (
        <Dialog
          id={id}
          width={1}
          open={dialogOpen}
          onClose={close}
          header="Translate fields"
          footer={
            <Flex justify="space-between" padding={2} flex={1}>
              {runDisabled ? (
                <Tooltip
                  content={
                    <Flex padding={2}>
                      <Text>Nothing to translate.</Text>
                    </Flex>
                  }
                  placement="top"
                >
                  <Flex flex={1}>{runButton}</Flex>
                </Tooltip>
              ) : (
                runButton
              )}
            </Flex>
          }
        >
          {languages ? (
            <Flex padding={4} gap={5} align="flex-start" justify="center">
              <Stack space={2}>
                <Box marginBottom={2}>
                  <Text weight="semibold">From</Text>
                </Box>
                {languages?.map((l) => (
                  <Flex key={l.id} gap={3} align="center">
                    <Radio
                      name="fromLang"
                      value={l.id}
                      checked={l.id === fromLanguage?.id}
                      onClick={() => selectFromLanguage(l, languages, document, documentSchema)}
                    />
                    <Text>{l.title ?? l.id}</Text>
                  </Flex>
                ))}
              </Stack>

              <Stack space={2}>
                <Box marginBottom={2}>
                  <Text weight="semibold">To</Text>
                </Box>
                {languages
                  ?.filter((l) => l.id !== fromLanguage?.id)
                  .map((l) => (
                    <Flex key={l.id} gap={3} align="center">
                      <Checkbox
                        name="toLang"
                        value={l.id}
                        checked={!!toLanguages?.find((tl) => tl.id === l.id)}
                        onClick={() => toggleToLanguage(l, toLanguages, languages)}
                        disabled={
                          !translationMap?.find((tm) => tm.outputs.find((o) => o.id === l.id))
                        }
                      />
                      <Text>{l.title ?? l.id}</Text>
                    </Flex>
                  ))}
              </Stack>
            </Flex>
          ) : (
            <Flex padding={4} gap={2} align="flex-start" justify="center">
              <Box>
                <Spinner />
              </Box>
              <Text>Loading languages...</Text>
            </Flex>
          )}
        </Dialog>
      ) : null}
      {props.children}
    </FieldTranslationContext.Provider>
  )
}
