import type {SanityClient} from '@sanity/client'
import {useToast} from '@sanity/ui'
import {useCallback, useMemo, useState} from 'react'
import {Path, pathToString, useClient, useCurrentUser} from 'sanity'

import {useAiAssistanceConfig, useSerializedTypes} from './assistLayout/AiAssistanceConfigContext'
import {ConditionalMemberState} from './helpers/conditionalMembers'
import {FieldLanguageMap} from './translate/paths'
import {documentRootKey} from './types'

export interface UserTextInstance {
  blockKey: string
  userInput: string
}

export interface RunInstructionRequest {
  documentId: string
  assistDocumentId: string
  path: string
  typePath?: string
  instructionKey: string
  userId?: string
  userTexts?: UserTextInstance[]
  conditionalMembers?: ConditionalMemberState[]
}

export interface InstructStatus {
  enabled: boolean
  initialized: boolean
  validToken: boolean
}

export interface TranslateRequest {
  documentId: string
  translatePath: Path
  languagePath?: string
  styleguide: () => Promise<string | undefined>
  fieldLanguageMap?: FieldLanguageMap[]
  conditionalMembers?: ConditionalMemberState[]
}

const basePath = '/assist/tasks/instruction'
export const API_VERSION_WITH_EXTENDED_TYPES = '2025-04-01'

export function canUseAssist(status: InstructStatus | undefined) {
  return status?.enabled && status.initialized && status.validToken
}

export function useApiClient(customApiClient?: (defaultClient: SanityClient) => SanityClient) {
  const client = useClient({apiVersion: API_VERSION_WITH_EXTENDED_TYPES})
  return useMemo(
    () => (customApiClient ? customApiClient(client) : client),
    [client, customApiClient],
  )
}

export function useTranslate(apiClient: SanityClient) {
  const [loading, setLoading] = useState(false)
  const user = useCurrentUser()
  const types = useSerializedTypes()
  const toast = useToast()

  const translate = useCallback(
    ({
      documentId,
      languagePath,
      styleguide,
      translatePath,
      fieldLanguageMap,
      conditionalMembers,
    }: TranslateRequest) => {
      setLoading(true)

      async function run() {
        return apiClient.request({
          method: 'POST',
          url: `/assist/tasks/translate/${apiClient.config().dataset}?projectId=${
            apiClient.config().projectId
          }`,
          body: {
            documentId,
            types,
            languagePath,
            userStyleguide: await styleguide(),
            fieldLanguageMap,
            conditionalMembers,
            translatePath:
              translatePath.length === 0 ? documentRootKey : pathToString(translatePath),
            userId: user?.id,
          },
        })
      }

      return run()
        .catch((e) => {
          toast.push({
            status: 'error',
            title: 'Translate failed',
            description: e.message,
          })
          setLoading(false)
          throw e
        })
        .finally(() => {
          // adding some artificial delay here
          // server responds with 201 then proceeds; we dont need to allow spamming the button
          setTimeout(() => {
            setLoading(false)
          }, 2000)
        })
    },
    [setLoading, apiClient, toast, user, types],
  )

  return useMemo(
    () => ({
      translate,
      loading,
    }),
    [translate, loading],
  )
}

export function useGenerateCaption(apiClient: SanityClient) {
  const [loading, setLoading] = useState(false)
  const user = useCurrentUser()
  const types = useSerializedTypes()
  const toast = useToast()

  const generateCaption = useCallback(
    ({path, documentId}: {path: string; documentId: string}) => {
      setLoading(true)

      return apiClient
        .request({
          method: 'POST',
          url: `/assist/tasks/generate-caption/${apiClient.config().dataset}?projectId=${
            apiClient.config().projectId
          }`,
          body: {
            path,
            documentId,
            types,
            userId: user?.id,
          },
        })
        .catch((e) => {
          toast.push({
            status: 'error',
            title: 'Generate image description failed',
            description: e.message,
          })
          setLoading(false)
          throw e
        })
        .finally(() => {
          // adding some artificial delay here
          // server responds with 201 then proceeds; we dont need to allow spamming the button
          setTimeout(() => {
            setLoading(false)
          }, 2000)
        })
    },
    [setLoading, apiClient, toast, user, types],
  )

  return useMemo(
    () => ({
      generateCaption,
      loading,
    }),
    [generateCaption, loading],
  )
}

export function useGenerateImage(apiClient: SanityClient) {
  const [loading, setLoading] = useState(false)
  const user = useCurrentUser()
  const types = useSerializedTypes()
  const toast = useToast()

  const generateImage = useCallback(
    ({path, documentId}: {path: string; documentId: string}) => {
      setLoading(true)

      return apiClient
        .request({
          method: 'POST',
          url: `/assist/tasks/generate-image/${apiClient.config().dataset}?projectId=${
            apiClient.config().projectId
          }`,
          body: {
            path,
            documentId,
            types,
            userId: user?.id,
          },
        })
        .catch((e) => {
          toast.push({
            status: 'error',
            title: 'Generate image from prompt failed',
            description: e.message,
          })
          setLoading(false)
          throw e
        })
        .finally(() => {
          // adding some artificial delay here
          // server responds with 201 then proceeds; we dont need to allow spamming the button
          setTimeout(() => {
            setLoading(false)
          }, 2000)
        })
    },
    [setLoading, apiClient, toast, user, types],
  )

  return useMemo(
    () => ({
      generateImage,
      loading,
    }),
    [generateImage, loading],
  )
}

export function useGetInstructStatus(apiClient: SanityClient) {
  const [loading, setLoading] = useState(true)

  const getInstructStatus = useCallback(async () => {
    setLoading(true)

    const projectId = apiClient.config().projectId
    try {
      const status = await apiClient.request<InstructStatus>({
        method: 'GET',
        url: `${basePath}/${apiClient.config().dataset}/status?projectId=${projectId}`,
      })

      return status
    } finally {
      setLoading(false)
    }
  }, [setLoading, apiClient])

  return {
    loading,
    getInstructStatus,
  }
}

export function useInitInstruct(apiClient: SanityClient) {
  const [loading, setLoading] = useState(false)
  const initInstruct = useCallback(() => {
    setLoading(true)
    return apiClient
      .request({
        method: 'GET',
        url: `${basePath}/${apiClient.config().dataset}/init?projectId=${
          apiClient.config().projectId
        }`,
      })
      .finally(() => {
        setLoading(false)
      })
  }, [setLoading, apiClient])

  return {
    loading,
    initInstruct,
  }
}

export function useRunInstructionApi(apiClient: SanityClient) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const user = useCurrentUser()
  const types = useSerializedTypes()

  const {
    config: {assist: assistConfig},
  } = useAiAssistanceConfig()

  const runInstruction = useCallback(
    (request: RunInstructionRequest) => {
      if (!user) {
        toast.push({
          status: 'error',
          title: 'Unable to get user for instruction.',
        })
        return undefined
      }
      setLoading(true)

      const {timeZone, locale} = Intl.DateTimeFormat().resolvedOptions()
      const defaultLocaleSettings = {timeZone, locale}
      const localeSettings =
        assistConfig?.localeSettings?.({user, defaultSettings: defaultLocaleSettings}) ??
        defaultLocaleSettings

      return apiClient
        .request({
          method: 'POST',
          url: `${basePath}/${apiClient.config().dataset}?projectId=${
            apiClient.config().projectId
          }`,
          body: {
            ...request,
            types,
            userId: user?.id,
            localeSettings,
            maxPathDepth: assistConfig?.maxPathDepth,
          },
        })
        .catch((e) => {
          toast.push({
            status: 'error',
            title: 'Instruction failed',
            description: e.message,
          })
          throw e
        })
        .finally(() => {
          setLoading(false)
        })
    },
    [apiClient, types, user, toast, assistConfig],
  )

  return useMemo(
    () => ({
      runInstruction,
      loading,
    }),
    [runInstruction, loading],
  )
}
