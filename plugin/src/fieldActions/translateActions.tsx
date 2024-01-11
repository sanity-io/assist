/* eslint-disable react-hooks/rules-of-hooks */
import {
  DocumentFieldAction,
  DocumentFieldActionGroup,
  DocumentFieldActionItem,
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

function node(node: DocumentFieldActionItem | DocumentFieldActionGroup) {
  return node
}

export const translateActions: DocumentFieldAction = {
  name: 'sanity-assist-translate',
  useAction(props) {
    const {config} = useAiAssistanceConfig()
    const apiClient = useApiClient(config?.__customApiClient)
    const {translate, loading} = useTranslate(apiClient)

    const isDocumentLevel = props.path.length === 0
    const {schemaType, documentId} = props

    if (isDocumentLevel) {
      const {value: documentValue} = useDocumentPane()
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
                icon: loading
                  ? () => (
                      <Box style={{height: 17}}>
                        <Spinner style={{transform: 'translateY(6px)'}} />
                      </Box>
                    )
                  : TranslateIcon,
                title: `Translate document`,
                onAction: () => {
                  if (loading || !languagePath || !documentId) {
                    return
                  }
                  translate({languagePath, documentId: documentId ?? ''})
                },
                renderAsButton: true,
                disabled: loading,
              })
            : undefined,
        [languagePath, translate, documentId, loading, documentTranslation]
      )

      const fieldTranslate = useFieldTranslation()

      const fieldTransEnabled = config.translate?.field?.documentTypes?.includes(schemaType.name)
      const translateFieldsAction = useMemo(
        () =>
          fieldTransEnabled
            ? node({
                type: 'action',
                icon: loading
                  ? () => (
                      <Box style={{height: 17}}>
                        <Spinner style={{transform: 'translateY(6px)'}} />
                      </Box>
                    )
                  : TranslateIcon,
                title: `Translate fields`,
                onAction: () => {
                  if (loading || !documentId) {
                    return
                  }
                  fieldTranslate.openFieldTranslation(
                    docRef.current,
                    schemaType as ObjectSchemaType
                  )
                },
                renderAsButton: true,
                disabled: loading,
              })
            : undefined,
        [fieldTranslate, schemaType, documentId, loading, fieldTransEnabled]
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
