import {createContext, useContext} from 'react'

import {AssistPluginConfig} from '../plugin'
import {InstructStatus} from '../useApiClient'
import {SerializedSchemaType} from '../types'
import {FieldRef} from '../assistInspector/helpers'

export interface AiAssistanceConfigContextValue {
  config: AssistPluginConfig
  status?: InstructStatus
  statusLoading: boolean
  initLoading: boolean
  init: () => void
  error?: Error
  serializedTypes: SerializedSchemaType[]
  getFieldRefs: (documentType: string) => FieldRef[]
  getFieldRefsByTypePath: (documentType: string) => Record<string, FieldRef | undefined>
}

export const AiAssistanceConfigContext = createContext<AiAssistanceConfigContextValue>({} as any)

export function useAiAssistanceConfig() {
  const context = useContext(AiAssistanceConfigContext)
  if (!context) {
    throw new Error('Missing AiAssistanceConfigContext')
  }
  return context
}

export function useSerializedTypes() {
  return useAiAssistanceConfig().serializedTypes
}
