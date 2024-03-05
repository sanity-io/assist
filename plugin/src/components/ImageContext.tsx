import {createContext, useEffect, useMemo, useState} from 'react'
import {InputProps, pathToString, useSyncState} from 'sanity'
import {getDescriptionFieldOption, getImageInstructionFieldOption} from '../helpers/typeUtils'
import {useAssistDocumentContext} from '../assistDocument/AssistDocumentContext'
import {canUseAssist, useApiClient, useGenerateCaption} from '../useApiClient'
import {useAiAssistanceConfig} from '../assistLayout/AiAssistanceConfigContext'
import {publicId} from '../helpers/ids'

export interface ImageContextValue {
  imageDescriptionPath?: string
  imageInstructionPath?: string
  assetRef?: string
}

export const ImageContext = createContext<ImageContextValue>({})

export function ImageContextProvider(props: InputProps) {
  const {schemaType, path, value} = props
  const assetRef = (value as any)?.asset?._ref
  const [assetRefState, setAssetRefState] = useState<string | undefined>(assetRef)

  const {documentId, documentSchemaType} = useAssistDocumentContext()
  const {config, status} = useAiAssistanceConfig()
  const apiClient = useApiClient(config?.__customApiClient)
  const {generateCaption} = useGenerateCaption(apiClient)

  const {isSyncing} = useSyncState(publicId(documentId), documentSchemaType.name)

  useEffect(() => {
    const descriptionField = getDescriptionFieldOption(schemaType)
    if (
      assetRef &&
      documentId &&
      descriptionField &&
      assetRef !== assetRefState &&
      !isSyncing &&
      canUseAssist(status)
    ) {
      setAssetRefState(assetRef)
      generateCaption({path: pathToString([...path, descriptionField]), documentId: documentId})
    }
  }, [schemaType, path, assetRef, assetRefState, documentId, generateCaption, isSyncing, status])

  const context: ImageContextValue = useMemo(() => {
    const descriptionField = getDescriptionFieldOption(schemaType)
    const imageInstructionField = getImageInstructionFieldOption(schemaType)
    return {
      imageDescriptionPath: descriptionField
        ? pathToString([...path, descriptionField])
        : undefined,
      imageInstructionPath: imageInstructionField
        ? pathToString([...path, imageInstructionField])
        : undefined,
      assetRef,
    }
  }, [schemaType, path, assetRef])

  return <ImageContext.Provider value={context}>{props.renderDefault(props)}</ImageContext.Provider>
}
