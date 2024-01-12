/* eslint-disable react-hooks/rules-of-hooks */
import {
  DocumentFieldAction,
  DocumentFieldActionGroup,
  DocumentFieldActionItem,
  DocumentFieldActionProps,
  ObjectSchemaType,
} from 'sanity'
import {TranslateIcon} from '@sanity/icons'
import {useMemo, useRef} from 'react'
import {useApiClient, useTranslate} from '../useApiClient'
import {useAiAssistanceConfig} from '../assistLayout/AiAssistanceConfigContext'
import {Box, Spinner} from '@sanity/ui'
import {isAssistSupported} from '../helpers/assistSupported'
import {useDocumentPane} from 'sanity/desk'
import {useFieldTranslation} from '../translate/FieldTranslationProvider'
import {useDraftDelayedTask} from '../assistDocument/RequestRunInstructionProvider'

function node(node: DocumentFieldActionItem | DocumentFieldActionGroup) {
  return node
}

export type TranslateProps = DocumentFieldActionProps & {documentIsAssistable?: boolean}
export const translateActions: DocumentFieldAction = {
  name: 'sanity-assist-translate',
  useAction(props: TranslateProps) {
    const {config} = useAiAssistanceConfig()
    const apiClient = useApiClient(config?.__customApiClient)

    const isDocumentLevel = props.path.length === 0
    const {schemaType, documentId, documentIsAssistable} = props

    // if this is true, it is stable, and not breaking rules of hooks
    if (isDocumentLevel) {
      const {value: documentValue, onChange: documentOnChange} = useDocumentPane()
      const translationApi = useTranslate(apiClient)

      const translate = useDraftDelayedTask({
        documentOnChange,
        isDocAssistable: documentIsAssistable ?? false,
        task: translationApi.translate,
      })

      const docRef = useRef(documentValue)
      docRef.current = documentValue

      const docTransTypes = config.translate?.document?.documentTypes
      const documentTranslation =
        (!docTransTypes && isAssistSupported(schemaType)) ||
        docTransTypes?.includes(schemaType.name)
      const languagePath = config.translate?.document?.languageField

      //const {value: languageId} = extractWithPath(languagePath, documentValue)[0] ?? {}
      // if this is true, it is stable, and not breaking rules of hooks
      const translateDocumentAction = useMemo(
        () =>
          languagePath && documentTranslation
            ? node({
                type: 'action',
                icon: translationApi.loading
                  ? () => (
                      <Box style={{height: 17}}>
                        <Spinner style={{transform: 'translateY(6px)'}} />
                      </Box>
                    )
                  : TranslateIcon,
                title: `Translate document`,
                onAction: () => {
                  if (translationApi.loading || !languagePath || !documentId) {
                    return
                  }
                  translate({languagePath, documentId: documentId ?? ''})
                },
                renderAsButton: true,
                disabled: translationApi.loading,
              })
            : undefined,
        [languagePath, translate, documentId, translationApi.loading, documentTranslation]
      )

      const fieldTranslate = useFieldTranslation()
      const openFieldTranslation = useDraftDelayedTask({
        documentOnChange,
        isDocAssistable: documentIsAssistable ?? false,
        task: fieldTranslate.openFieldTranslation,
      })
      const fieldTransEnabled = config.translate?.field?.documentTypes?.includes(schemaType.name)

      const translateFieldsAction = useMemo(
        () =>
          fieldTransEnabled
            ? node({
                type: 'action',
                icon: fieldTranslate.translationLoading
                  ? () => (
                      <Box style={{height: 17}}>
                        <Spinner style={{transform: 'translateY(6px)'}} />
                      </Box>
                    )
                  : TranslateIcon,
                title: `Translate fields`,
                onAction: () => {
                  if (fieldTranslate.translationLoading || !documentId) {
                    return
                  }
                  openFieldTranslation({
                    document: docRef.current,
                    documentSchema: schemaType as ObjectSchemaType,
                  })
                },
                renderAsButton: true,
                disabled: fieldTranslate.translationLoading,
              })
            : undefined,
        [
          openFieldTranslation,
          schemaType,
          documentId,
          fieldTranslate.translationLoading,
          fieldTransEnabled,
        ]
      )

      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useMemo(() => {
        return node({
          type: 'group',
          icon: () => null,
          title: 'Translate',
          children: [translateDocumentAction, translateFieldsAction].filter(
            (c): c is DocumentFieldActionItem => !!c
          ),
          expanded: true,
        })
      }, [translateDocumentAction, translateFieldsAction])
    }
    // works but not supported by types
    return undefined as unknown as DocumentFieldActionItem
  },
}
