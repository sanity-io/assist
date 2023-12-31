import {DocumentFieldAction, DocumentFieldActionGroup, DocumentFieldActionItem} from 'sanity'
import {ImageIcon} from '@sanity/icons'
import {useContext, useMemo} from 'react'
import {usePathKey} from '../helpers/misc'
import {useApiClient, useGenerateCaption} from '../useApiClient'
import {useAiAssistanceConfig} from '../assistLayout/AiAssistanceConfigContext'
import {useAssistDocumentContext} from '../assistDocument/AssistDocumentContext'
import {ImageContext} from '../components/ImageContext'
import {Box, Spinner} from '@sanity/ui'

function node(node: DocumentFieldActionItem | DocumentFieldActionGroup) {
  return node
}

export const generateCaptionsActions: DocumentFieldAction = {
  name: 'sanity-assist-generate-captions',
  useAction(props) {
    const pathKey = usePathKey(props.path)

    const {config} = useAiAssistanceConfig()
    const apiClient = useApiClient(config?.__customApiClient)
    const {generateCaption, loading} = useGenerateCaption(apiClient)

    const imageContext = useContext(ImageContext)

    if (imageContext && pathKey === imageContext?.captionPath) {
      //if this is true, it is stable, and not breaking rules of hooks
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const {documentId} = useAssistDocumentContext()
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useMemo(() => {
        return node({
          type: 'action',
          icon: loading
            ? () => (
                <Box style={{height: 17}}>
                  <Spinner style={{transform: 'translateY(6px)'}} />
                </Box>
              )
            : ImageIcon,
          title: 'Generate caption',
          onAction: () => {
            if (loading) {
              return
            }
            generateCaption({path: pathKey, documentId: documentId ?? ''})
          },
          renderAsButton: true,
          disabled: loading,
          hidden: !imageContext.assetRef,
        })
      }, [generateCaption, pathKey, documentId, loading, imageContext])
    }

    // works but not supported by types
    return undefined as unknown as DocumentFieldActionItem
  },
}
