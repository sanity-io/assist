import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {AssistPluginConfig} from '../plugin'
import {InstructStatus, useApiClient, useGetInstructStatus, useInitInstruct} from '../useApiClient'

export interface AiAssistanceConfigContextValue {
  config: AssistPluginConfig
  status?: InstructStatus
  statusLoading: boolean
  initLoading: boolean
  init: () => void
  error?: Error
}

export const AiAssistanceConfigContext = createContext<AiAssistanceConfigContextValue>({} as any)

export function useAiAssistanceConfig() {
  const context = useContext(AiAssistanceConfigContext)
  if (!context) {
    throw new Error('Missing AiAssistanceConfigContext')
  }
  return context
}

export function AiAssistanceConfigProvider(props: {
  children?: ReactNode
  config: AssistPluginConfig
}) {
  const [status, setStatus] = useState<InstructStatus | undefined>()
  const [error, setError] = useState<Error | undefined>()

  const apiClient = useApiClient(props.config?.__customApiClient)
  const {getInstructStatus, loading: statusLoading} = useGetInstructStatus(apiClient)
  const {initInstruct, loading: initLoading} = useInitInstruct(apiClient)

  useEffect(() => {
    getInstructStatus()
      .then((s) => setStatus(s))
      .catch((e) => {
        console.error(e)
        setError(e as Error)
      })
  }, [getInstructStatus])

  const init = useCallback(async () => {
    setError(undefined)
    try {
      await initInstruct()
      const status = await getInstructStatus()
      setStatus(status)
    } catch (e) {
      console.error('Failed to init ai assistance', e)
      setError(e as Error)
    }
  }, [initInstruct, getInstructStatus, setStatus])

  const {config, children} = props
  const context = useMemo<AiAssistanceConfigContextValue>(() => {
    return {
      config,
      status,
      statusLoading,
      init,
      initLoading,
      error,
    }
  }, [config, status, init, statusLoading, initLoading, error])

  return (
    <AiAssistanceConfigContext.Provider value={context}>
      {children}
    </AiAssistanceConfigContext.Provider>
  )
}
