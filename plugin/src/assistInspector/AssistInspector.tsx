import {ArrowRightIcon, CloseIcon, PlayIcon, RetryIcon} from '@sanity/icons'
import {Box, Button, Card, Flex, Spinner, Stack, Text} from '@sanity/ui'
import {useCallback, useMemo, useRef} from 'react'
import {
  type DocumentInspectorProps,
  PresenceOverlay,
  VirtualizerScrollInstanceProvider,
} from 'sanity'
import {
  DocumentInspectorHeader,
  type DocumentPaneNode,
  DocumentPaneProvider,
  useDocumentPane,
} from 'sanity/structure'
import {styled} from 'styled-components'

import {DocumentForm} from '../_lib/form'
import {useAssistDocumentContext} from '../assistDocument/AssistDocumentContext'
import {AssistTypeContext} from '../assistDocument/components/AssistTypeContext'
import {useStudioAssistDocument} from '../assistDocument/hooks/useStudioAssistDocument'
import {useRequestRunInstruction} from '../assistDocument/RequestRunInstructionProvider'
import {useAiAssistanceConfig} from '../assistLayout/AiAssistanceConfigContext'
import {giveFeedbackUrl, pluginTitle, releaseAnnouncementUrl, salesUrl} from '../constants'
import {getConditionalMembers} from '../helpers/conditionalMembers'
import {assistDocumentId} from '../helpers/ids'
import {InspectorOnboarding} from '../onboarding/InspectorOnboarding'
import {inspectorOnboardingKey, useOnboardingFeature} from '../onboarding/onboardingStore'
import {assistDocumentTypeName, fieldPathParam, instructionParam} from '../types'
import {FieldTitle} from './FieldAutocomplete'
import {
  type FieldRef,
  getFieldTitle,
  useAiPaneRouter,
  useSelectedField,
  useTypePath,
} from './helpers'
import {InstructionTaskHistoryButton} from './InstructionTaskHistoryButton'

const CardWithShadowBelow = styled(Card)`
  position: relative;

  &:after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    border-bottom: 1px solid var(--card-border-color);
    opacity: 0.5;
    z-index: 100;
  }
`

const CardWithShadowAbove = styled(Card)`
  position: relative;

  &:after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    top: -1px;
    border-top: 1px solid var(--card-border-color);
    opacity: 0.5;
    z-index: 100;
  }
`

export function AssistInspectorWrapper(props: DocumentInspectorProps) {
  const context = useAiAssistanceConfig()

  if (context.statusLoading) {
    return (
      <Flex align="center" height="fill" justify="center" padding={4} sizing="border">
        <Stack space={3} style={{textAlign: 'center'}}>
          <Spinner muted />
          <Text muted size={1}>
            Loading {pluginTitle}...
          </Text>
        </Stack>
      </Flex>
    )
  }

  const status = context.status

  if (!status?.enabled) {
    return (
      <Flex direction="column" height="fill">
        <DocumentInspectorHeader
          closeButtonLabel="Close"
          onClose={props.onClose}
          title={pluginTitle}
        />

        <Stack flex={1} overflow="auto" padding={4} space={3}>
          <Text as="p" size={1} weight="semibold">
            {pluginTitle} is not available
          </Text>

          <Text as="p" muted size={1}>
            Please get in touch with a Sanity account manager or{' '}
            <a href={salesUrl} target="_blank" rel="noreferrer">
              contact our sales team
            </a>{' '}
            to get started with {pluginTitle}.{' '}
            <a href={releaseAnnouncementUrl} target="_blank" rel="noreferrer">
              Learn more &rarr;
            </a>
          </Text>
        </Stack>
      </Flex>
    )
  }

  if (!status?.initialized || !status.validToken) {
    return (
      <Flex direction="column" height="fill">
        <DocumentInspectorHeader
          closeButtonLabel="Close"
          onClose={props.onClose}
          title={pluginTitle}
        />

        <Stack padding={4} space={3}>
          {context.error ? (
            <Text size={1} weight="semibold">
              Failed to start {pluginTitle}
            </Text>
          ) : null}

          {!context.error && !status?.initialized ? (
            <Text size={1} weight="semibold">
              {pluginTitle} is not enabled
            </Text>
          ) : null}

          {!context.error && status?.initialized && !status.validToken ? (
            <>
              <Text size={1} weight="semibold">
                Invalid token
              </Text>
              <Text muted size={1}>
                The token used by the AI Assistant is not valid and has to be regenerated.
              </Text>
            </>
          ) : null}

          {context.error && (
            <Text muted size={1}>
              Something went wrong. See console for details.
            </Text>
          )}

          {!context.error && !status?.initialized && (
            <Text size={1} muted>
              Please enable {pluginTitle}.
            </Text>
          )}

          <Button
            fontSize={1}
            icon={
              context.initLoading ? (
                <Box marginTop={1}>
                  <Spinner />
                </Box>
              ) : context.error ? (
                RetryIcon
              ) : undefined
            }
            text={
              context.error
                ? 'Retry'
                : status?.initialized && !status.validToken
                  ? `Restore ${pluginTitle}`
                  : `Enable ${pluginTitle} now`
            }
            tone="primary"
            onClick={context.init}
            disabled={context.initLoading}
          />
        </Stack>
      </Flex>
    )
  }

  return <AssistInspector {...props} />
}

export function AssistInspector(props: DocumentInspectorProps) {
  const {params} = useAiPaneRouter()

  const boundary = useRef<HTMLDivElement | null>(null)
  const pathKey = params?.[fieldPathParam]
  const instructionKey = params?.[instructionParam]
  const documentPane = useDocumentPane()
  const {
    documentId,
    documentType,
    value: docValue,
    schemaType,
    onChange: documentOnChange,
    formState,
  } = documentPane

  const {assistableDocumentId, documentIsAssistable} = useAssistDocumentContext()

  const formStateRef = useRef(formState)
  formStateRef.current = formState

  const {instructionLoading, requestRunInstruction} = useRequestRunInstruction({
    documentOnChange,
    isDocAssistable: documentIsAssistable,
  })

  const typePath = useTypePath(docValue, pathKey ?? '')
  const selectedField = useSelectedField(schemaType, typePath)

  const aiDocId = assistDocumentId(documentType)

  const assistDocument = useStudioAssistDocument({documentId, schemaType, initDoc: true})
  const assistField = assistDocument?.fields?.find((f) => f.path === typePath)
  const instruction = assistField?.instructions?.find((i) => i._key === instructionKey)
  const tasks = useMemo(
    () =>
      assistDocument?.tasks?.filter((i) => !instructionKey || i.instructionKey === instructionKey),
    [assistDocument?.tasks, instructionKey],
  )
  const instructions = useMemo(
    () => assistDocument?.fields?.flatMap((f) => f.instructions ?? []),
    [assistDocument?.fields],
  )

  const promptValue = instruction?.prompt
  const isEmptyPrompt = useMemo(() => {
    if (!promptValue?.length) {
      return true
    }
    const firstBlock = promptValue[0] as any
    const children = firstBlock?.children

    return promptValue.length == 1 && children?.length === 1 && !children?.[0]?.text?.length
  }, [promptValue])

  const paneNode: DocumentPaneNode = useMemo(
    () => ({
      type: 'document',
      id: aiDocId,
      title: pluginTitle,
      options: {
        id: aiDocId,
        type: assistDocumentTypeName,
      },
    }),
    [aiDocId],
  )

  const runCurrentInstruction = useCallback(
    () =>
      instruction &&
      pathKey &&
      typePath &&
      requestRunInstruction({
        documentId: assistableDocumentId,
        path: pathKey,
        typePath,
        assistDocumentId: assistDocumentId(documentType),
        instruction,
        conditionalMembers: formStateRef.current ? getConditionalMembers(formStateRef.current) : [],
      }),
    [pathKey, instruction, typePath, documentType, assistableDocumentId, requestRunInstruction],
  )

  const Region = useCallback((_props: any) => {
    // disabled for now
    /* return (
        <ConnectToRegion
          {..._props}
          _key={`${paneKey}_${selectedField?.key || '_field'}`}
          style={{height: '100%', flex: 1, overflow: 'auto'}}
        />
      )*/
    return <div {..._props} style={{height: '100%', flex: 1, overflow: 'auto'}} />
  }, [])

  const assistTypeContext = useMemo(() => ({typePath, documentType}), [typePath, documentType])

  if (!documentId || !schemaType || schemaType.jsonType !== 'object') {
    return (
      <Card flex={1} padding={4}>
        <Text>Document not ready yet.</Text>
      </Card>
    )
  }

  return (
    <Flex
      ref={boundary}
      direction="column"
      height="fill"
      overflow="hidden"
      sizing="border"
      style={{lineHeight: 0}}
    >
      <AiInspectorHeader
        onClose={props.onClose}
        field={selectedField}
        fieldTitle={getFieldTitle(selectedField)}
      />

      <Card as={Region} flex={1} overflow="auto">
        <Flex direction="column" style={{minHeight: '100%'}}>
          <Box flex={1}>
            <PresenceOverlay>
              <Box padding={4}>
                {selectedField && (
                  <AssistTypeContext.Provider value={assistTypeContext}>
                    <VirtualizerScrollInstanceProvider
                      scrollElement={boundary.current}
                      containerElement={boundary}
                    >
                      <DocumentPaneProvider
                        paneKey={documentPane.paneKey}
                        index={documentPane.index}
                        itemId="ai"
                        pane={paneNode}
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        //@ts-ignore this is a valid option available in `corel` - Remove after corel is merged to next
                        forcedVersion={{
                          isReleaseLocked: false,
                          selectedPerspectiveName: 'published',
                          selectedReleaseId: undefined,
                        }}
                      >
                        <DocumentForm />
                      </DocumentPaneProvider>
                    </VirtualizerScrollInstanceProvider>
                  </AssistTypeContext.Provider>
                )}
              </Box>
            </PresenceOverlay>
          </Box>

          <Box flex="none" padding={4}>
            <Text muted size={1}>
              How is Sanity AI Assist working for you?{' '}
              <a
                href={giveFeedbackUrl}
                target="_blank"
                rel="noreferrer"
                style={{whiteSpace: 'nowrap'}}
              >
                Let us know <ArrowRightIcon />
              </a>
            </Text>
          </Box>
        </Flex>
      </Card>
      <CardWithShadowAbove flex="none" paddingX={4} paddingY={3} style={{justifySelf: 'flex-end'}}>
        <Flex gap={2} flex={1} justify="flex-end">
          {schemaType?.name && pathKey && instructionKey && (
            <Stack flex={1}>
              <Button
                mode="ghost"
                disabled={isEmptyPrompt || instructionLoading}
                fontSize={1}
                icon={instructionLoading ? <Spinner style={{marginTop: 3}} /> : PlayIcon}
                onClick={runCurrentInstruction}
                padding={3}
                text={'Run instruction'}
              />
            </Stack>
          )}

          <InstructionTaskHistoryButton
            documentId={assistableDocumentId}
            tasks={tasks}
            instructions={instructions}
            showTitles={!instructionKey}
          />
        </Flex>
      </CardWithShadowAbove>
    </Flex>
  )
}

function AiInspectorHeader(props: {fieldTitle: string; field?: FieldRef; onClose: () => void}) {
  const {onClose, field, fieldTitle} = props
  const {showOnboarding, dismissOnboarding} = useOnboardingFeature(inspectorOnboardingKey)

  return (
    <CardWithShadowBelow flex="none" padding={2}>
      <Flex flex={1} align="center">
        <Flex flex={1} padding={3} gap={2} align="center">
          <Flex gap={1} align="center" wrap="wrap" style={{marginTop: '-4px'}}>
            <Box marginTop={1}>
              <Text size={1} weight="semibold">
                AI instructions for
              </Text>
            </Box>
            <Card radius={2} border padding={1} marginTop={1}>
              {field ? (
                <FieldTitle field={field} />
              ) : (
                <Text size={1} weight="semibold">
                  {fieldTitle}
                </Text>
              )}
            </Card>
          </Flex>
        </Flex>
        <Box flex="none">
          <Button fontSize={1} icon={CloseIcon} mode="bleed" onClick={onClose} />
        </Box>
      </Flex>

      {showOnboarding && <InspectorOnboarding onDismiss={dismissOnboarding} />}
    </CardWithShadowBelow>
  )
}
