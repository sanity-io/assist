import {createContext, useEffect, useMemo, useState} from 'react'
import {getPublishedId, type InputProps, pathToString, useSyncState} from 'sanity'
import {useDocumentPane, usePaneRouter} from 'sanity/structure'

import {useAssistDocumentContext} from '../assistDocument/AssistDocumentContext'
import {useAiAssistanceConfig} from '../assistLayout/AiAssistanceConfigContext'
import {getDescriptionFieldOption, getImageInstructionFieldOption} from '../helpers/typeUtils'
import {canUseAssist, useApiClient, useGenerateCaption} from '../useApiClient'

export interface ImageContextValue {
  imageDescriptionPath?: string
  imageInstructionPath?: string
  assetRef?: string
}

export const ImageContext = createContext<ImageContextValue>({})

export function ImageContextProvider(props: InputProps) {
  const {schemaType, path, value, readOnly} = props
  const assetRef = (value as any)?.asset?._ref
  const {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore this is a valid option available in `corel` - Remove after corel is merged to next
    selectedReleaseId,
  } = useDocumentPane()
  const [assetRefState, setAssetRefState] = useState<string | undefined>(assetRef)

  const {documentId, documentSchemaType} = useAssistDocumentContext()
  const {config, status} = useAiAssistanceConfig()
  const apiClient = useApiClient(config?.__customApiClient)
  const {generateCaption} = useGenerateCaption(apiClient)

  const {isSyncing} = useSyncState(
    getPublishedId(documentId),
    documentSchemaType.name,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore this is a valid option available in `corel` - Remove after corel is merged to next
    selectedReleaseId ? {version: selectedReleaseId} : undefined,
  )

  const router = usePaneRouter()
  const isShowingOlderRevision = !!router.params?.rev

  useEffect(() => {
    const descriptionField = getDescriptionFieldOption(schemaType)
    if (
      assetRef &&
      documentId &&
      descriptionField &&
      assetRef !== assetRefState &&
      !isSyncing &&
      !isShowingOlderRevision &&
      !readOnly
    ) {
      setAssetRefState(assetRef)
      if (canUseAssist(status)) {
        generateCaption({path: pathToString([...path, descriptionField]), documentId: documentId})
      }
    }
  }, [
    schemaType,
    path,
    assetRef,
    assetRefState,
    documentId,
    generateCaption,
    isSyncing,
    status,
    readOnly,
    isShowingOlderRevision,
  ])

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
