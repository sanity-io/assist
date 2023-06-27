import {useClient, useCurrentUser, useSchema} from 'sanity'
import {useCallback, useMemo, useState} from 'react'
import {serializeSchema} from './schemas/serialize/serializeSchema'
import {useToast} from '@sanity/ui'
import {SanityClient} from '@sanity/client'

export interface UserTextInstance {
  blockKey: string
  userInput: string
}

export interface RunInstructionRequest {
  documentId: string
  assistDocumentId: string
  path: string
  instructionKey: string
  userId?: string
  userTexts?: UserTextInstance[]
}

export interface InstructStatus {
  enabled: boolean
  initialized: boolean
  validToken: boolean
}

const basePath = '/assist/tasks/instruction'
const editorialAiFieldActionFeature = 'editorialAiFieldActions'

export function useApiClient(customApiClient?: (defaultClient: SanityClient) => SanityClient) {
  const client = useClient({apiVersion: '2023-06-05'})
  return useMemo(
    () => (customApiClient ? customApiClient(client) : client),
    [client, customApiClient]
  )
}

export function useGetInstructStatus(apiClient: SanityClient) {
  const [loading, setLoading] = useState(true)
  const projectClient = useClient({apiVersion: '2023-06-05'})

  const getInstructStatus = useCallback(async () => {
    setLoading(true)

    const projectId = apiClient.config().projectId
    try {
      const features = await projectClient.request<string[]>({
        method: 'GET',
        url: `/projects/${projectId}/features`,
      })

      const enabled = features.some((f) => f === editorialAiFieldActionFeature)

      const status = await apiClient.request<Omit<InstructStatus, 'enabled'>>({
        method: 'GET',
        url: `${basePath}/${apiClient.config().dataset}/status?projectId=${projectId}`,
      })

      return {
        ...status,
        enabled,
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, apiClient, projectClient])

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
