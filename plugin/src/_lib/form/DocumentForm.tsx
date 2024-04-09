import {Box, type BoxProps, Flex, focusFirstDescendant, Spinner, Text} from '@sanity/ui'
import type React from 'react'
import {type HTMLProps, useEffect, useMemo, useRef} from 'react'
import {tap} from 'rxjs/operators'
import {
  createPatchChannel,
  type DocumentMutationEvent,
  type DocumentRebaseEvent,
  FormBuilder,
  fromMutationPatches,
  type PatchMsg,
  useDocumentPresence,
  useDocumentStore,
} from 'sanity'
import {useDocumentPane} from 'sanity/structure'

import {assistFormId} from './constants'

const preventDefault = (ev: React.FormEvent) => ev.preventDefault()

export function DocumentForm(
  props: Omit<BoxProps, 'as'> & Omit<HTMLProps<HTMLDivElement>, 'as' | 'onSubmit' | 'ref'>,
) {
  const {
    collapsedFieldSets,
    collapsedPaths,
    displayed: value,
    documentId,
    documentType,
    editState,
    formState,
    onBlur,
    onChange,
    onFocus,
    onPathOpen,
    onSetActiveFieldGroup,
    onSetCollapsedFieldSet,
    onSetCollapsedPath,
    ready,
    validation,
  } = useDocumentPane()

  const documentStore = useDocumentStore()
  const presence = useDocumentPresence(documentId)

  // The `patchChannel` is an INTERNAL publish/subscribe channel that we use to notify form-builder
  // nodes about both remote and local patches.
  // - Used by the Portable Text input to modify selections.
  // - Used by `withDocument` to reset value.
  const patchChannel = useMemo(() => createPatchChannel(), [])

  const isLocked = editState?.transactionSyncLock?.enabled

  useEffect(() => {
    const sub = documentStore.pair
      .documentEvents(documentId, documentType)
      .pipe(
        tap((event) => {
          if (event.type === 'mutation') {
            patchChannel.publish(prepareMutationEvent(event))
          }

          if (event.type === 'rebase') {
            patchChannel.publish(prepareRebaseEvent(event))
          }
        }),
      )
      .subscribe()

    return () => {
      sub.unsubscribe()
    }
  }, [documentId, documentStore, documentType, patchChannel])

  const hasRev = Boolean(value?._rev)
  useEffect(() => {
    if (hasRev) {
      // this is a workaround for an issue that caused the document pushed to withDocument to get
      // stuck at the first initial value.
      // This effect is triggered only when the document goes from not having a revision, to getting one
      // so it will kick in as soon as the document is received from the backend
      patchChannel.publish({
        type: 'mutation',
        patches: [],
        snapshot: value,
      })
    }
    // React to changes in hasRev only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRev])

  const formRef = useRef<null | HTMLDivElement>(null)

  useEffect(() => {
    focusFirstDescendant(formRef.current!)
  }, [])

  if (isLocked) {
    return (
      <Box as="form" {...props} ref={formRef}>
        <Flex
          align="center"
          direction="column"
          height="fill"
          justify="center"
          padding={3}
          sizing="border"
        >
          <Text size={1}>
            Please hold tight while the document is synced. This usually happens right after the
            document has been published, and it shouldn’t take more than a few seconds
          </Text>
        </Flex>
      </Box>
    )
  }

  return (
    <Box as="form" {...props} onSubmit={preventDefault} ref={formRef}>
      {ready ? (
        formState === null ? (
          <Flex
            align="center"
            direction="column"
            height="fill"
            justify="center"
            padding={3}
            sizing="border"
          >
            <Text size={1}>This form is hidden</Text>
          </Flex>
        ) : (
          <FormBuilder
            __internal_patchChannel={patchChannel}
            collapsedFieldSets={collapsedFieldSets}
            collapsedPaths={collapsedPaths}
            focusPath={formState.focusPath}
            changed={formState.changed}
            focused={formState.focused}
            groups={formState.groups}
            id={assistFormId}
            members={formState.members}
            onChange={onChange}
            onFieldGroupSelect={onSetActiveFieldGroup}
            onPathBlur={onBlur}
            onPathFocus={onFocus}
            onPathOpen={onPathOpen}
            onSetFieldSetCollapsed={onSetCollapsedFieldSet}
            onSetPathCollapsed={onSetCollapsedPath}
            presence={presence}
            readOnly={formState.readOnly}
            schemaType={formState.schemaType}
            validation={validation}
            value={formState.value as any}
          />
        )
      ) : (
        <Flex
          align="center"
          direction="column"
          height="fill"
          justify="center"
          padding={3}
          sizing="border"
        >
          <Spinner muted />

          <Box marginTop={3}>
            <Text align="center" muted size={1}>
              Loading document
            </Text>
          </Box>
        </Flex>
      )}
    </Box>
  )
}

function prepareMutationEvent(event: DocumentMutationEvent): PatchMsg {
  const patches = event.mutations.map((mut) => mut.patch).filter(Boolean)

  return {
    type: 'mutation',
    snapshot: event.document,
    patches: fromMutationPatches(event.origin, patches),
  }
}

function prepareRebaseEvent(event: DocumentRebaseEvent): PatchMsg {
  const remotePatches = event.remoteMutations.map((mut) => mut.patch).filter(Boolean)
  const localPatches = event.localMutations.map((mut) => mut.patch).filter(Boolean)

  return {
    type: 'rebase',
    snapshot: event.document,
    patches: fromMutationPatches('remote', remotePatches).concat(
      fromMutationPatches('local', localPatches),
    ),
  }
}
