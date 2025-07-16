import {ReactNode, useCallback, useEffect, useMemo, useState} from 'react'
import {AssistPluginConfig} from '../plugin'
import {InstructStatus, useApiClient, useGetInstructStatus, useInitInstruct} from '../useApiClient'
import {type ObjectSchemaType, Schema, useSchema} from 'sanity'
import {serializeSchema} from '../schemas/serialize/serializeSchema'
import {
  AiAssistanceConfigContext,
  AiAssistanceConfigContextValue,
} from './AiAssistanceConfigContext'
import {createFieldRefCache} from './fieldRefCache'

export function AiAssistanceConfigProvider(props: {
  children?: ReactNode
  config: AssistPluginConfig
}) {
  const [status, setStatus] = useState<InstructStatus | undefined>()
  const [error, setError] = useState<Error | undefined>()

  const apiClient = useApiClient(props.config?.__customApiClient)
  const {getInstructStatus, loading: statusLoading} = useGetInstructStatus(apiClient)
  const {initInstruct, loading: initLoading} = useInitInstruct(apiClient)

  const schema = useSchema()
  const serializedTypes = useMemo(() => serializeSchema(schema, {leanFormat: true}), [schema])
  const {getFieldRefs, getFieldRefsByTypePath} = useFieldRefGetters(schema)

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
      serializedTypes,
      getFieldRefs,
      getFieldRefsByTypePath,
    }
  }, [
    config,
    status,
    init,
    statusLoading,
    initLoading,
    error,
    serializedTypes,
    getFieldRefs,
    getFieldRefsByTypePath,
  ])

  return (
    <AiAssistanceConfigContext.Provider value={context}>
      {children}
    </AiAssistanceConfigContext.Provider>
  )
}

function useFieldRefGetters(schema: Schema) {
  return useMemo(() => {
    const getForSchemaType = createFieldRefCache()

    function getRefsForType(documentType: string) {
      const schemaType = schema.get(documentType) as ObjectSchemaType | undefined
      if (!schemaType) {
        throw new Error(`Schema type "${documentType}" not found`)
      }
      return getForSchemaType(schemaType)
    }

    return {
      getFieldRefs: (documentType: string) => getRefsForType(documentType).fieldRefs,
      getFieldRefsByTypePath: (documentType: string) =>
        getRefsForType(documentType).fieldRefsByTypePath,
    }
  }, [schema])
}
