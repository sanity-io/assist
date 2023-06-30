import {SanityClient, SanityDocument, useClient} from 'sanity'
import {useCallback, useEffect, useState} from 'react'
import {Box, Button, Card, Dialog, Spinner, Stack, Text, useToast} from '@sanity/ui'
import {CheckmarkIcon} from '@sanity/icons'
import {
  LegacyAssistDocument,
  legacyAssistDocumentIdPrefix,
  legacyAssistDocumentTypeName,
  legacyAssistStatusDocumentTypeName,
  LegacyContextBlock,
  legacyContextDocumentTypeName,
  LegacyFieldRef,
  LegacyPromptBlock,
  LegacyPromptTextBlock,
  LegacyUserInputBlock,
} from '../legacy-types'
import {assistDocumentId} from '../helpers/ids'
import {
  assistDocumentIdPrefix,
  assistDocumentTypeName,
  AssistField,
  assistFieldTypeName,
  contextDocumentTypeName,
  fieldReferenceTypeName,
  InlinePromptBlock,
  instructionContextTypeName,
  instructionTypeName,
  PromptBlock,
  userInputTypeName,
} from '../types'
import {PortableTextSpan} from '@portabletext/types'
import {pluginTitle} from '../constants'

const NO_ASSIST_DOCS: LegacyAssistDocument[] = []
const NO_CONTEXT_DOCS: SanityDocument[] = []
const NO_IDS: string[] = []

interface MigratedContextDoc {
  _id: string
  _alphaId: string
}

type Task = (subtaskProgress: (percentage: number) => void) => Promise<void>

export function AlphaMigration() {
  const [alphaAssistDocs, setAlphaAssistDocs] = useState(NO_ASSIST_DOCS)
  const [contextDocs, setContextDocs] = useState(NO_CONTEXT_DOCS)
  const [staleStatusDocIds, setStaleStatusDocs] = useState(NO_IDS)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [progress, setProgress] = useState<number | undefined>(undefined)
  const toast = useToast()
  const client = useClient({apiVersion: '2023-06-01'})

  useEffect(() => {
    let canUpdate = true
    client
      .fetch<{
        assistDocs?: LegacyAssistDocument[]
        staleStatusDocIds?: string[]
        contextDocs?: SanityDocument[]
      }>(
        `
    {
      "assistDocs": *[_type=="${legacyAssistDocumentTypeName}"],
      "staleStatusDocIds": *[_type=="${legacyAssistStatusDocumentTypeName}"]._id,
      "contextDocs": *[_type=="${legacyContextDocumentTypeName}"],
     }
    `
      )
      .then((result) => {
        if (!canUpdate || !result) {
          return
        }
        setAlphaAssistDocs(result?.assistDocs ?? NO_ASSIST_DOCS)
        setStaleStatusDocs(result?.staleStatusDocIds ?? NO_IDS)
        setContextDocs(result?.contextDocs ?? NO_CONTEXT_DOCS)
      })
    return () => {
      canUpdate = false
    }
  }, [client, setAlphaAssistDocs, setStaleStatusDocs, setContextDocs])

  const convert = useCallback(async () => {
    try {
      setProgress(0.0001)

      const tasks: Task[] = [
        () => convertContextDocs(client, contextDocs),
        (subtaskProgress) => deleteDocs(client, staleStatusDocIds, subtaskProgress),
        (subtaskProgress) => convertDocs(client, alphaAssistDocs, subtaskProgress),
        (subtaskProgress) =>
          deleteDocs(
            client,
            contextDocs.map((d) => d._id),
            subtaskProgress
          ),
      ]

      const taskSize = 1 / tasks.length
      for (let i = 0; i < tasks.length; i++) {
        const startProgress = i / tasks.length
        await tasks[i]((subProgress) => setProgress(startProgress + subProgress * taskSize))
        setProgress((i + 1) / tasks.length)
      }

      setProgress(1)
      setAlphaAssistDocs(NO_ASSIST_DOCS)
      setContextDocs(NO_CONTEXT_DOCS)
      setStaleStatusDocs(NO_IDS)
      toast.push({
        title: `Converted instructions to new format.`,
        status: 'success',
        closable: true,
      })
    } catch (e: any) {
      console.error(e)
      toast.push({
        title: `An error occurred`,
        status: 'error',
        closable: true,
      })
      setError(e)
      setProgress(undefined)
    }
  }, [contextDocs, client, alphaAssistDocs, staleStatusDocIds, setProgress, toast])

  if (
    (alphaAssistDocs.length || staleStatusDocIds.length || contextDocs.length) &&
    (!progress || progress < 1)
  ) {
    return (
      <Dialog id="outdated-assist-docs" header={pluginTitle}>
        <Card padding={3}>
          <Stack space={4} style={{maxWidth: 500}}>
            <Text size={1}>
              It seems like this workspace contains documents from an{' '}
              <strong>older version of {pluginTitle}</strong>.
            </Text>
            <Text size={1}>Cleanup is required.</Text>
            {error ? (
              <Card padding={2} tone="critical" border>
                <Text size={1}>An error occurred. See console for details.</Text>{' '}
              </Card>
            ) : null}
            <Button
              icon={
                progress ? (
                  <Box style={{marginTop: 5}}>
                    <Spinner />
                  </Box>
                ) : (
                  CheckmarkIcon
                )
              }
              disabled={!!progress}
              text={progress ? `${Math.floor(progress * 100)}%` : 'Ok, convert to new format!'}
              tone="primary"
              onClick={convert}
            />
          </Stack>
        </Card>
      </Dialog>
    )
  }

  return null
}

async function deleteDocs(
  client: SanityClient,
  ids: string[],
  updateProgress: (percentage: number) => void
) {
  const chunkSize = 50
  for (let i = 0; i < ids.length; i += chunkSize) {
    const progressCount = Math.min(ids.length, i + chunkSize)
    const chunk = ids.slice(i, progressCount)
    const trans = client.transaction()
    chunk.forEach((id) => trans.delete(id))
    await trans.commit()
    updateProgress(progressCount / ids.length)
  }
}

async function convertContextDocs(client: SanityClient, docs: SanityDocument[]) {
  const trans = client.transaction()

  for (const doc of docs) {
    const {_id, _type, ...rest} = doc
    trans.createOrReplace({
      ...rest,
      _id: `port.${_id}`,
      _alphaId: _id,
      _type: contextDocumentTypeName,
    })
  }

  await trans.commit()
}

async function convertDocs(
  client: SanityClient,
  docs: LegacyAssistDocument[],
  updateProgress: (percentage: number) => void
) {
  const chunkSize = 10
  for (let i = 0; i < docs.length; i += chunkSize) {
    const progressCount = Math.min(docs.length, i + chunkSize)
    const chunk = docs.slice(i, progressCount)

    const trans = client.transaction()
    const contextDocs: MigratedContextDoc[] = await client.fetch(
      `*[_type=="${contextDocumentTypeName}" && _alphaId != null]{_id, _alphaId}`
    )

    chunk.forEach((oldDoc) => {
      const documentType = oldDoc._id.replace(
        new RegExp(`^(${legacyAssistDocumentIdPrefix}|${assistDocumentIdPrefix})`),
        ''
      )

      const id = assistDocumentId(documentType)

      const fields: AssistField[] = (oldDoc.fields ?? [])
        .filter((field) => field.instructions?.length)
        .map((oldField) => {
          const instructions = (oldField.instructions ?? []).map((inst) => {
            // eslint-disable-next-line max-nested-callbacks
            const prompt = (inst.prompt ?? []).map((block) => {
              return mapBlock(block, contextDocs) as PromptBlock
            })
            return {
              ...inst,
              _type: instructionTypeName,
              prompt,
            }
          })
          return {
            ...oldField,
            _type: assistFieldTypeName,
            instructions,
          }
        })

      if (fields.length) {
        trans.createOrReplace({
          _id: id,
          _type: assistDocumentTypeName,
          fields,
        })
      }
      trans.delete(oldDoc._id)
    })
    await trans.commit()
    updateProgress(progressCount / docs.length)
  }
}

type Blocks = LegacyPromptBlock | LegacyPromptTextBlock | PortableTextSpan

function isFieldRef(block: Blocks): block is LegacyFieldRef {
  return block._type === 'sanity.ai.prompt.fieldRef'
}

function isContext(block: Blocks): block is LegacyContextBlock {
  return block._type === 'sanity.ai.prompt.context'
}

function isUserInput(block: Blocks): block is LegacyUserInputBlock {
  return block._type === 'sanity.ai.prompt.userInput'
}

function isSpan(block: Blocks): block is PortableTextSpan {
  return block._type === 'span'
}

function mapBlock(
  block: Blocks,
  migratedContexts: MigratedContextDoc[]
): PromptBlock | InlinePromptBlock {
  if (isFieldRef(block)) {
    return {...block, _type: fieldReferenceTypeName}
  }
  if (isUserInput(block)) {
    return {...block, _type: userInputTypeName}
  }
  if (isContext(block)) {
    const newBlock = {
      ...block,
      _type: instructionContextTypeName,
      reference: {
        _type: 'reference',
        _ref:
          migratedContexts.find((c) => c._alphaId === block.reference?._ref)?._id ??
          block.reference?._ref,
      },
    } as const
    return newBlock
  }
  if (isSpan(block)) {
    return block
  }
  const textBlock = block
  return {
    ...textBlock,
    children: (textBlock.children ?? []).map(
      (child) => mapBlock(child, migratedContexts) as InlinePromptBlock
    ),
  }
}
