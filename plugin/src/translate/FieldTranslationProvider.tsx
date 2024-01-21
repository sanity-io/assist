import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react'
import {ObjectSchemaType, Path, pathToString, SanityDocumentLike, useClient} from 'sanity'
import {useAiAssistanceConfig} from '../assistLayout/AiAssistanceConfigContext'
import {useApiClient, useTranslate} from '../useApiClient'
import {Box, Button, Checkbox, Dialog, Flex, Radio, Spinner, Stack, Text, Tooltip} from '@sanity/ui'
import {
  defaultLanguageOutputs,
  FieldLanguageMap,
  getDocumentMembersFlat,
  getFieldLanguageMap,
} from './paths'
import {PlayIcon} from '@sanity/icons'
import {Language} from './types'
import {getLanguageParams} from './getLanguageParams'
import {getPreferredToFieldLanguages, setPreferredToFieldLanguages} from './languageStore'
import {ConditionalMemberState} from '../helpers/conditionalMembers'

interface FieldTranslationParams {
  document: SanityDocumentLike
  documentSchema: ObjectSchemaType
  translatePath: Path
  conditionalMembers: ConditionalMemberState[]
}

export interface FieldTranslationContextValue {
  openFieldTranslation: (args: FieldTranslationParams) => void
  translationLoading: boolean
}

export const FieldTranslationContext = createContext<FieldTranslationContextValue>({
  openFieldTranslation: () => {},
  translationLoading: false,
})

export function useFieldTranslation() {
  return useContext(FieldTranslationContext)
}

function hasValuesToTranslate(
  fieldLanguageMaps: FieldLanguageMap[] | undefined,
  fromLanguage: Language | undefined,
  basePath: Path
) {
  return fieldLanguageMaps?.some(
    (map) =>
      map.inputLanguageId === fromLanguage?.id &&
      map.inputPath &&
      pathToString(map.inputPath).startsWith(pathToString(basePath))
  )
}

export function FieldTranslationProvider(props: PropsWithChildren<{}>) {
  const {config: assistConfig} = useAiAssistanceConfig()
  const apiClient = useApiClient(assistConfig.__customApiClient)
  const config = assistConfig.translate?.field
  const {translate: runTranslate} = useTranslate(apiClient)

  const [dialogOpen, setDialogOpen] = useState(false)

  const [fieldTranslationParams, setFieldTranslationParams] = useState<
    FieldTranslationParams | undefined
  >()
  const [languages, setLanguages] = useState<Language[] | undefined>()
  const [fromLanguage, setFromLanguage] = useState<Language | undefined>(undefined)
  const [toLanguages, setToLanguages] = useState<Language[] | undefined>(undefined)
  const [fieldLanguageMaps, setFieldLanguageMaps] = useState<FieldLanguageMap[] | undefined>()

  const close = useCallback(() => {
    setDialogOpen(false)
    setLanguages(undefined)
    setFieldTranslationParams(undefined)
  }, [])
  const languageClient = useClient({apiVersion: config?.apiVersion ?? '2022-11-27'})
  const documentId = fieldTranslationParams?.document?._id
  const id = useId()

  const selectFromLanguage = useCallback(
    (
      from: Language,
      languages: Language[] | undefined,
      params: FieldTranslationParams | undefined
    ) => {
      const {document, documentSchema} = params ?? {}
      setFromLanguage(from)
      if (!document || !documentSchema || !params || !languages) {
        setFieldLanguageMaps(undefined)
        return
      }

      const preferred = getPreferredToFieldLanguages(from.id)
      const allToLanguages = languages.filter((l) => l.id !== from?.id)
      const filteredToLanguages = allToLanguages.filter(
        (l) => !preferred.length || preferred.includes(l.id)
      )

      setToLanguages(filteredToLanguages)
      const fromId = from?.id
      const allToIds = allToLanguages?.map((l) => l.id) ?? []
      const docMembers = getDocumentMembersFlat(document, documentSchema)
      if (fromId && allToIds?.length) {
        const transMap = getFieldLanguageMap(
          documentSchema,
          docMembers,
          fromId,
          allToIds.filter((toId) => fromId !== toId),
          config?.translationOutputs ?? defaultLanguageOutputs
        )
        setFieldLanguageMaps(transMap)
      } else {
        setFieldLanguageMaps(undefined)
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
      if (!languages || !fromLanguage) {
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
      setPreferredToFieldLanguages(
        fromLanguage.id,
        newToLangs.map((l) => l.id)
      )
    },
    [fromLanguage]
  )

  const openFieldTranslation = useCallback(
    async (params: FieldTranslationParams) => {
      setDialogOpen(true)
      const languageParams = getLanguageParams(config?.selectLanguageParams, params.document)
      const languages: Language[] | undefined = await (typeof config?.languages === 'function'
        ? config?.languages(languageClient, languageParams)
        : Promise.resolve(config?.languages))
      setLanguages(languages)
      setFieldTranslationParams(params)
      const fromLanguage = languages?.[0]
      if (fromLanguage) {
        selectFromLanguage(fromLanguage, languages, params)
      } else {
        console.error('No languages available for selected language params', languageParams)
      }
    },
    [selectFromLanguage, config, languageClient]
  )

  const contextValue: FieldTranslationContextValue = useMemo(() => {
    return {
      openFieldTranslation,
      translationLoading: false,
    }
  }, [openFieldTranslation])

  const runDisabled =
    !fromLanguage ||
    !toLanguages?.length ||
    !fieldLanguageMaps?.length ||
    !documentId ||
    !hasValuesToTranslate(fieldLanguageMaps, fromLanguage, fieldTranslationParams.translatePath)

  const onRunTranslation = useCallback(() => {
    const translatePath = fieldTranslationParams?.translatePath
    if (fieldLanguageMaps && documentId && translatePath) {
      runTranslate({
        documentId,
        translatePath: translatePath,
        fieldLanguageMap: fieldLanguageMaps.map((map) => ({
          ...map,
          // eslint-disable-next-line max-nested-callbacks
          outputs: map.outputs.filter((out) => !!toLanguages?.find((l) => l.id === out.id)),
        })),
        conditionalMembers: fieldTranslationParams?.conditionalMembers,
      })
    }
    close()
  }, [
    fieldLanguageMaps,
    documentId,
    runTranslate,
    close,
    toLanguages,
    fieldTranslationParams?.translatePath,
  ])

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
                      <Text>There is nothing to translate in the selected from-language.</Text>
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
                {languages?.map((l) => {
                  return (
                    <Flex key={l.id} gap={3} align="center" as={'label'}>
                      <Radio
                        name="fromLang"
                        value={l.id}
                        checked={l.id === fromLanguage?.id}
                        onChange={() => selectFromLanguage(l, languages, fieldTranslationParams)}
                      />
                      <Text>{l.title ?? l.id}</Text>
                    </Flex>
                  )
                })}
              </Stack>

              <Stack space={2}>
                <Box marginBottom={2}>
                  <Text weight="semibold">To</Text>
                </Box>
                {languages.map((l) => (
                  <Flex
                    key={l.id}
                    gap={3}
                    align="center"
                    as={'label'}
                    style={l.id === fromLanguage?.id ? {opacity: 0.5} : undefined}
                  >
                    <Checkbox
                      name="toLang"
                      value={l.id}
                      checked={
                        l.id !== fromLanguage?.id && !!toLanguages?.find((tl) => tl.id === l.id)
                      }
                      onChange={() => toggleToLanguage(l, toLanguages, languages)}
                      disabled={l.id === fromLanguage?.id}
                    />
                    <Text muted={l.id === fromLanguage?.id}>{l.title ?? l.id}</Text>
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
