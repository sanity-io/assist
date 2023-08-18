import {createContext, useEffect, useMemo, useState} from 'react'
import {InputProps, pathToString} from 'sanity'
import {getCaptionFieldOption} from '../helpers/typeUtils'
import {useAssistDocumentContext} from '../assistDocument/AssistDocumentContext'
import {useApiClient, useGenerateCaption} from '../useApiClient'
import {useAiAssistanceConfig} from '../assistLayout/AiAssistanceConfigContext'

export interface ImageContextValue {
  captionPath: string
  assetRef?: string
}

export const ImageContext = createContext<ImageContextValue | undefined>(undefined)

export function ImageContextProvider(props: InputProps) {
  const {schemaType, path, value} = props
  const assetRef = (value as any)?.asset?._ref
  const [assetRefState, setAssetRefState] = useState<string | undefined>(assetRef)

  const {documentId} = useAssistDocumentContext()
  const {config} = useAiAssistanceConfig()
  const apiClient = useApiClient(config?.__customApiClient)
  const {generateCaption} = useGenerateCaption(apiClient)

  useEffect(() => {
    const captionField = getCaptionFieldOption(schemaType)
    if (assetRef && documentId && captionField && assetRef !== assetRefState) {
      setAssetRefState(assetRef)
      generateCaption({path: pathToString([...path, captionField]), documentId: documentId})
    }
  }, [schemaType, path, assetRef, assetRefState, documentId, generateCaption])

  const context: ImageContextValue | undefined = useMemo(() => {
    const captionField = getCaptionFieldOption(schemaType)
    return captionField ? {captionPath: pathToString([...path, captionField]), assetRef} : undefined
  }, [schemaType, path, assetRef])

  return <ImageContext.Provider value={context}>{props.renderDefault(props)}</ImageContext.Provider>
}
