import {Path, pathToString, useClient, useCurrentUser, useSchema} from 'sanity'
import {useCallback, useMemo, useState} from 'react'
import {serializeSchema} from './schemas/serialize/serializeSchema'
import {useToast} from '@sanity/ui'
import {SanityClient} from '@sanity/client'
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
  fieldLanguageMap?: FieldLanguageMap[]
}

const basePath = '/assist/tasks/instruction'

export function useApiClient(customApiClient?: (defaultClient: SanityClient) => SanityClient) {
  const client = useClient({apiVersion: '2023-06-05'})
  return useMemo(
    () => (customApiClient ? customApiClient(client) : client),
    [client, customApiClient]
  )
}

export function useTranslate(apiClient: SanityClient) {
  const [loading, setLoading] = useState(false)
  const user = useCurrentUser()
  const schema = useSchema()
  const types = useMemo(() => serializeSchema(schema, {leanFormat: true}), [schema])
  const toast = useToast()

  const translate = useCallback(
    ({documentId, languagePath, translatePath, fieldLanguageMap}: TranslateRequest) => {
      setLoading(true)

      return apiClient
        .request({
          method: 'POST',
          url: `/assist/tasks/translate/${apiClient.config().dataset}?projectId=${
            apiClient.config().projectId
          }`,
          body: {
            documentId,
            types,
            languagePath,
            fieldLanguageMap,
            translatePath:
              translatePath.length === 0 ? documentRootKey : pathToString(translatePath),
            userId: user?.id,
          },
        })
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
    [setLoading, apiClient, toast, user, types]
  )

  return useMemo(
    () => ({
      translate,
      loading,
    }),
    [translate, loading]
  )
}

export function useGenerateCaption(apiClient: SanityClient) {
  const [loading, setLoading] = useState(false)
  const user = useCurrentUser()
  const schema = useSchema()
  const types = useMemo(() => serializeSchema(schema, {leanFormat: true}), [schema])
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
            title: 'Generate caption failed',
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
    [setLoading, apiClient, toast, user, types]
  )

  return useMemo(
    () => ({
      generateCaption,
      loading,
    }),
    [generateCaption, loading]
  )
}

export function useGenerateImage(apiClient: SanityClient) {
  const [loading, setLoading] = useState(false)
  const user = useCurrentUser()
  const schema = useSchema()
  const types = useMemo(() => serializeSchema(schema, {leanFormat: true}), [schema])
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
    [setLoading, apiClient, toast, user, types]
  )

  return useMemo(
    () => ({
      generateImage,
      loading,
    }),
    [generateImage, loading]
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
  const schema = useSchema()
  const types = useMemo(() => serializeSchema(schema, {leanFormat: true}), [schema])

  const runInstruction = useCallback(
    (request: RunInstructionRequest) => {
      setLoading(true)
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
    [apiClient, types, user, toast]
  )

  return useMemo(
    () => ({
      runInstruction,
      loading,
    }),
    [runInstruction, loading]
  )
}
