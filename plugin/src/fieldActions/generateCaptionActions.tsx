import {DocumentFieldAction, DocumentFieldActionGroup, DocumentFieldActionItem} from 'sanity'
import {ImageIcon} from '@sanity/icons'
import {useContext, useMemo} from 'react'
import {usePathKey} from '../helpers/misc'
import {canUseAssist, useApiClient, useGenerateCaption} from '../useApiClient'
import {useAiAssistanceConfig} from '../assistLayout/AiAssistanceConfigContext'
import {useAssistDocumentContext} from '../assistDocument/AssistDocumentContext'
import {ImageContext} from '../components/ImageContext'
import {Box, Spinner} from '@sanity/ui'
import {useDocumentPane} from 'sanity/desk'
import {aiInspectorId} from '../assistInspector/constants'
import {fieldPathParam, instructionParam} from '../types'

function node(node: DocumentFieldActionItem | DocumentFieldActionGroup) {
  return node
}

export const generateCaptionsActions: DocumentFieldAction = {
  name: 'sanity-assist-generate-captions',
  useAction(props) {
    const pathKey = usePathKey(props.path)
    const {openInspector} = useDocumentPane()

    const {config, status} = useAiAssistanceConfig()
    const apiClient = useApiClient(config?.__customApiClient)
    const {generateCaption, loading} = useGenerateCaption(apiClient)
    const imageContext = useContext(ImageContext)

    if (imageContext && pathKey === imageContext?.imageDescriptionPath) {
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
          title: 'Generate image description',
          onAction: () => {
            if (loading) {
              return
            }
            if (!canUseAssist(status)) {
              openInspector(aiInspectorId, {
                [fieldPathParam]: pathKey,
                [instructionParam]: undefined as any,
              })
              return
            }

            generateCaption({path: pathKey, documentId: documentId ?? ''})
          },
          renderAsButton: true,
          disabled: loading,
          hidden: !imageContext.assetRef,
        })
      }, [generateCaption, pathKey, documentId, loading, imageContext, status, openInspector])
    }

    // works but not supported by types
    return undefined as unknown as DocumentFieldActionItem
  },
}
