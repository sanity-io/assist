import {ControlsIcon, SparklesIcon} from '@sanity/icons'
import {useCallback, useMemo, useRef} from 'react'
import {
  type DocumentFieldAction,
  type DocumentFieldActionGroup,
  type DocumentFieldActionItem,
  type ObjectSchemaType,
  typed,
  useCurrentUser,
} from 'sanity'
import {useDocumentPane} from 'sanity/structure'

import {useAssistDocumentContext} from '../assistDocument/AssistDocumentContext'
import {getIcon} from '../assistDocument/components/instruction/appearance/IconInput'
import {useAssistDocumentContextValue} from '../assistDocument/hooks/useAssistDocumentContextValue'
import {useRequestRunInstruction} from '../assistDocument/RequestRunInstructionProvider'
import {aiInspectorId} from '../assistInspector/constants'
import {useSelectedField, useTypePath} from '../assistInspector/helpers'
import {pluginTitleShort} from '../constants'
import {isSchemaAssistEnabled} from '../helpers/assistSupported'
import {getConditionalMembers} from '../helpers/conditionalMembers'
import {getInstructionTitle, usePathKey} from '../helpers/misc'
import {useAssistSupported} from '../helpers/useAssistSupported'
import {translateActions, type TranslateProps} from '../translate/translateActions'
import {documentRootKey, fieldPathParam, instructionParam, type StudioInstruction} from '../types'
import {generateCaptionsActions} from './generateCaptionActions'
import {generateImagActions} from './generateImageActions'
import {PrivateIcon} from './PrivateIcon'

function node(node: DocumentFieldActionItem | DocumentFieldActionGroup) {
  return node
}

export const assistFieldActions: DocumentFieldAction = {
  name: 'sanity-assist-actions',
  useAction(props) {
    const {schemaType} = props

    const isDocumentLevel = props.path.length === 0

    const {
      assistDocument,
      documentIsNew,
      documentIsAssistable,
      openInspector,
      closeInspector,
      inspector,
      documentOnChange,
      documentSchemaType,
      selectedPath,
      assistableDocumentId,
    } =
      // document field actions do not have access to the document context
      // conditional hook _should_ be safe here since the logical path will be stable
      isDocumentLevel
        ? // eslint-disable-next-line react-hooks/rules-of-hooks
          useAssistDocumentContextValue(props.documentId, schemaType as ObjectSchemaType)
        : // eslint-disable-next-line react-hooks/rules-of-hooks
          useAssistDocumentContext()

    const {value: docValue, formState} = useDocumentPane()
    const formStateRef = useRef(formState)
    formStateRef.current = formState

    const currentUser = useCurrentUser()
    const isHidden = !assistDocument
    const pathKey = usePathKey(props.path)
    const typePath = useTypePath(docValue, pathKey)
    const assistDocumentId = assistDocument?._id

    const {requestRunInstruction} = useRequestRunInstruction({
      documentOnChange,
      isDocAssistable: documentIsAssistable ?? false,
    })

    const isSelectable = !!useSelectedField(documentSchemaType, typePath)
    const assistSupported =
      useAssistSupported(props.path, schemaType) &&
      isSelectable &&
      isSchemaAssistEnabled(documentSchemaType) &&
      schemaType.readOnly !== true

    const fieldAssist = useMemo(
      () =>
        (assistDocument?.fields ?? []).find(
          (f) => f.path === typePath || (pathKey === documentRootKey && f.path === pathKey),
        ),
      [assistDocument?.fields, pathKey, typePath],
    )

    const fieldAssistKey = fieldAssist?._key
    const isInspectorOpen = inspector?.name === aiInspectorId
    const isPathSelected = pathKey === selectedPath
    const isSelected = isInspectorOpen && isPathSelected

    const imageCaptionAction = generateCaptionsActions.useAction(props)
    const imageGenAction = generateImagActions.useAction(props)
    const translateAction = translateActions.useAction(
      typed<TranslateProps>({
        ...props,
        documentId: assistableDocumentId,
        documentIsAssistable,
        documentSchemaType,
      }),
    )
    const manageInstructions = useCallback(
      () =>
        isSelected
          ? closeInspector(aiInspectorId)
          : openInspector(aiInspectorId, {
              [fieldPathParam]: pathKey,
              [instructionParam]: undefined as any,
            }),
      [openInspector, closeInspector, isSelected, pathKey],
    )

    const onInstructionAction = useCallback(
      (instruction: StudioInstruction) => {
        if (!pathKey || !fieldAssistKey || !assistDocumentId || !assistableDocumentId) {
          return
        }
        requestRunInstruction({
          documentId: assistableDocumentId,
          assistDocumentId,
          path: pathKey,
          typePath,
          instruction,
          conditionalMembers: formStateRef.current
            ? getConditionalMembers(formStateRef.current)
            : [],
        })
      },
      [
        requestRunInstruction,
        assistableDocumentId,
        pathKey,
        typePath,
        assistDocumentId,
        fieldAssistKey,
      ],
    )

    const privateInstructions = useMemo(
      () =>
        fieldAssist?.instructions?.filter((i) => i.userId && i.userId === currentUser?.id) || [],
      [fieldAssist?.instructions, currentUser],
    )

    const sharedInstructions = useMemo(
      () => fieldAssist?.instructions?.filter((i) => !i.userId) || [],
      [fieldAssist?.instructions],
    )

    const instructions = useMemo(
      () => [...privateInstructions, ...sharedInstructions],
      [privateInstructions, sharedInstructions],
    )

    const runInstructionsGroup = useMemo(() => {
      return instructions?.length || imageCaptionAction || translateAction || imageGenAction
        ? node({
            type: 'group',
            icon: () => null,
            title: 'Run instructions',
            children: [
              ...(instructions?.map((instruction) =>
                instructionItem({
                  instruction,
                  isPrivate: Boolean(instruction.userId && instruction.userId === currentUser?.id),
                  onInstructionAction,
                  hidden: isHidden,
                  documentIsNew: !!documentIsNew,
                  assistSupported,
                }),
              ) || []),
              imageCaptionAction,
              imageGenAction,
            ].filter((a): a is DocumentFieldActionItem => !!a),
            expanded: true,
          })
        : undefined
    }, [
      instructions,
      currentUser?.id,
      onInstructionAction,
      isHidden,
      documentIsNew,
      assistSupported,
      imageCaptionAction,
      translateAction,
      imageGenAction,
    ])

    const instructionsLength = instructions?.length || 0

    const manageInstructionsItem = useMemo(
      () =>
        node({
          type: 'action',
          icon: ControlsIcon,
          title: 'Manage instructions',
          onAction: manageInstructions,
          selected: isSelected,
        }),
      [manageInstructions, isSelected],
    )

    const group = useMemo(
      () =>
        node({
          type: 'group',
          icon: SparklesIcon,
          title: pluginTitleShort,
          children: [
            runInstructionsGroup,
            translateAction,
            assistSupported && manageInstructionsItem,
          ]
            .filter((c): c is DocumentFieldActionItem | DocumentFieldActionGroup => !!c)
            .filter((c) => (c.type === 'group' ? c.children.length : true)),
          expanded: false,
          renderAsButton: true,
          hidden: !assistSupported && !imageCaptionAction && !translateAction && !imageGenAction,
        }),
      [
        //documentIsNew,
        runInstructionsGroup,
        manageInstructionsItem,
        assistSupported,
        imageCaptionAction,
        translateAction,
        imageGenAction,
      ],
    )

    const emptyAction = useMemo(
      () =>
        node({
          type: 'action',
          hidden: !assistSupported,
          icon: SparklesIcon,
          onAction: manageInstructions,
          renderAsButton: true,
          title: pluginTitleShort,
          selected: isSelected,
        }),
      [assistSupported, manageInstructions, isSelected],
    )

    // If there are no instructions, we don't want to render the group
    if (instructionsLength === 0 && !imageCaptionAction && !translateAction && !imageGenAction) {
      return emptyAction
    }

    return group
  },
}

function instructionItem(props: {
  instruction: StudioInstruction
  isPrivate: boolean
  onInstructionAction: (ins: StudioInstruction) => void
  assistSupported: boolean
  documentIsNew: boolean
  hidden: boolean
}) {
  const {hidden, isPrivate, onInstructionAction, assistSupported, instruction} = props
  return node({
    type: 'action',
    icon: getIcon(instruction.icon),
    iconRight: isPrivate ? PrivateIcon : undefined,
    title: getInstructionTitle(instruction),
    onAction: () => onInstructionAction(instruction),
    disabled: !assistSupported,
    hidden,
  })
}
