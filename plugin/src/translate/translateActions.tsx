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
import {useFieldTranslation} from './FieldTranslationProvider'
import {useDraftDelayedTask} from '../assistDocument/RequestRunInstructionProvider'
import {AssistOptions} from '../schemas/typeDefExtensions'

function node(node: DocumentFieldActionItem | DocumentFieldActionGroup) {
  return node
}

export type TranslateProps = DocumentFieldActionProps & {
  documentIsAssistable?: boolean
  documentSchemaType?: ObjectSchemaType
}
export const translateActions: DocumentFieldAction = {
  name: 'sanity-assist-translate',
  useAction(props: TranslateProps) {
    const {config} = useAiAssistanceConfig()
    const apiClient = useApiClient(config?.__customApiClient)

    const {
      schemaType: fieldSchemaType,
      path,
      documentId,
      documentSchemaType,
      documentIsAssistable,
    } = props
    const isDocumentLevel = path.length === 0

    const docTransTypes = config.translate?.document?.documentTypes
    const options = fieldSchemaType?.options as AssistOptions | undefined
    const addFieldAction = isDocumentLevel || options?.aiWritingAssistance?.translateAction

    const fieldTransEnabled =
      addFieldAction &&
      documentSchemaType &&
      config.translate?.field?.documentTypes?.includes(documentSchemaType.name)
    const documentTranslationEnabled =
      addFieldAction &&
      documentSchemaType &&
      ((!docTransTypes && isAssistSupported(fieldSchemaType)) ||
        docTransTypes?.includes(documentSchemaType.name))

    // these checks are stable (ie, does not change after mount), so not breaking rules of hooks
    if (documentSchemaType && (documentTranslationEnabled || fieldTransEnabled)) {
      const {value: documentValue, onChange: documentOnChange} = useDocumentPane()
      const docRef = useRef(documentValue)

      const translationApi = useTranslate(apiClient)
      const translate = useDraftDelayedTask({
        documentOnChange,
        isDocAssistable: documentIsAssistable ?? false,
        task: translationApi.translate,
      })
      docRef.current = documentValue
      const languagePath = config.translate?.document?.languageField

      // if this is true, it is stable, and not breaking rules of hooks
      const translateDocumentAction = useMemo(() => {
        if (!languagePath || !documentTranslationEnabled) {
          return undefined
        }
        const title = path.length ? `Translate` : `Translate document`
        return node({
          type: 'action',
          icon: translationApi.loading
            ? () => (
                <Box style={{height: 17}}>
                  <Spinner style={{transform: 'translateY(6px)'}} />
                </Box>
              )
            : TranslateIcon,
          title,
          onAction: () => {
            if (translationApi.loading || !languagePath || !documentId) {
              return
            }
            translate({
              languagePath,
              translatePath: path,
              documentId: documentId ?? '',
            })
          },
          renderAsButton: true,
          disabled: translationApi.loading,
        })
      }, [
        languagePath,
        translate,
        documentId,
        translationApi.loading,
        documentTranslationEnabled,
        path,
      ])

      const fieldTranslate = useFieldTranslation()
      const openFieldTranslation = useDraftDelayedTask({
        documentOnChange,
        isDocAssistable: documentIsAssistable ?? false,
        task: fieldTranslate.openFieldTranslation,
      })

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
                title: `Translate fields...`,
                onAction: () => {
                  if (fieldTranslate.translationLoading || !documentId) {
                    return
                  }
                  openFieldTranslation({
                    document: docRef.current,
                    documentSchema: documentSchemaType,
                    translatePath: path,
                  })
                },
                renderAsButton: true,
                disabled: fieldTranslate.translationLoading,
              })
            : undefined,
        [
          openFieldTranslation,
          documentSchemaType,
          documentId,
          fieldTranslate.translationLoading,
          fieldTransEnabled,
          path,
        ]
      )

      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useMemo(() => {
        return node({
          type: 'group',
          icon: () => null,
          title: 'Translation',
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
