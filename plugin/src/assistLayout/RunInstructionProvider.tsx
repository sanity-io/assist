import {PlayIcon} from '@sanity/icons'
import {Button, Dialog, Flex, Stack, Text, TextArea, Tooltip} from '@sanity/ui'
import {FormFieldHeaderText} from 'sanity'

import {getInstructionTitle} from '../helpers/misc'
import {type UserInputBlock, userInputTypeName} from '../types'
import {useApiClient, useRunInstructionApi} from '../useApiClient'
import {useAiAssistanceConfig} from './AiAssistanceConfigContext'
import type {RunInstructionArgs} from './AssistLayout'
import {CustomInputResult, GetUserInput} from '../fieldActions/useUserInput'
import {
  createContext,
  type Dispatch,
  type FormEvent,
  type PropsWithChildren,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'

type BlockInputs = Record<string, string>
const NO_INPUT: BlockInputs = {}

export interface RunInstructionContextValue {
  runInstruction: (req: RunInstructionArgs) => void
  getUserInput: GetUserInput
  instructionLoading: boolean
}

export const RunInstructionContext = createContext<RunInstructionContextValue>({
  runInstruction: () => {},
  getUserInput: async () => undefined,
  instructionLoading: false,
})

export function useRunInstruction() {
  return useContext(RunInstructionContext)
}

function isUserInputBlock(block: {_type: string}): block is UserInputBlock {
  return block._type === userInputTypeName
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function RunInstructionProvider(props: PropsWithChildren<{}>) {
  const {config} = useAiAssistanceConfig()
  const apiClient = useApiClient(config?.__customApiClient)
  const {runInstruction: runInstructionRequest, loading} = useRunInstructionApi(apiClient)

  const id = useId()

  const [inputs, setInputs] = useState(NO_INPUT)
  const [runRequest, setRunRequest] = useState<
    | (RunInstructionArgs & {userInputBlocks: UserInputBlock[]})
    | {dialogTitle: string; userInputBlocks: UserInputBlock[]}
    | undefined
  >()

  const [resolveUserInput, setResolveUserInput] =
    useState<
      (
        value: CustomInputResult[] | PromiseLike<CustomInputResult[] | undefined> | undefined,
      ) => void
    >()

  const getUserInput: GetUserInput = useCallback(async ({title, inputs}) => {
    const userInputBlocks: UserInputBlock[] = inputs.map((input, i) => ({
      _type: userInputTypeName,
      _key: input.id ?? `${i}`,
      message: input.title,
      description: input.description,
    }))

    if (!userInputBlocks.length) {
      return undefined
    }
    setRunRequest({dialogTitle: title, userInputBlocks})
    return new Promise<CustomInputResult[] | undefined>((resolve) => {
      setResolveUserInput(() => resolve)
    })
  }, [])

  const runInstruction = useCallback(
    (req: RunInstructionArgs) => {
      if (loading) {
        return
      }
      const {instruction, ...request} = req
      const instructionKey = instruction._key
      const userInputBlocks = instruction?.prompt
        ?.flatMap((block) =>
          block._type === 'block' ? block.children.filter(isUserInputBlock) : [block],
        )
        .filter(isUserInputBlock)

      if (!userInputBlocks?.length) {
        runInstructionRequest({
          ...request,
          instructionKey,
          userTexts: undefined,
        })
        return
      }

      setRunRequest({
        ...req,
        userInputBlocks,
      })
    },
    [runInstructionRequest, loading],
  )

  const close = useCallback(() => {
    setRunRequest(undefined)
    setInputs(NO_INPUT)
    if (resolveUserInput) {
      resolveUserInput(undefined)
    }
    setResolveUserInput(undefined)
  }, [resolveUserInput])

  const runWithInput = useCallback(() => {
    if (runRequest) {
      if ('instruction' in runRequest) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {instruction, userTexts, ...request} = runRequest
        runInstructionRequest({
          ...request,
          instructionKey: instruction._key,
          userTexts: Object.entries(inputs).map(([key, value]) => ({
            blockKey: key,
            userInput: value,
          })),
        })
      } else {
        const userInputs = Object.values(inputs).map((input, i) => {
          const userInputBlock = runRequest.userInputBlocks[i]
          return {
            input: {
              id: userInputBlock._key,
              title: userInputBlock.message ?? '',
              description: userInputBlock.description,
            },
            result: input,
          }
        })
        resolveUserInput?.(userInputs)
        setResolveUserInput(undefined)
      }
    }
    close()
  }, [close, runInstructionRequest, runRequest, inputs, resolveUserInput])

  const open = !!runRequest

  const runDisabled = useMemo(
    () =>
      (runRequest?.userInputBlocks?.length ?? 0) >
      Object.entries(inputs).filter(([, value]) => !!value).length,
    [runRequest?.userInputBlocks, inputs],
  )

  const runButton = (
    <Button
      text="Run instruction"
      onClick={runWithInput}
      tone="primary"
      icon={PlayIcon}
      style={{width: '100%'}}
      disabled={runDisabled}
    />
  )

  const contextValue: RunInstructionContextValue = useMemo(
    () => ({runInstruction, getUserInput, instructionLoading: loading}),
    [runInstruction, loading],
  )

  return (
    <RunInstructionContext.Provider value={contextValue}>
      {open ? (
        <Dialog
          id={id}
          open={open}
          onClose={close}
          width={1}
          header={
            'dialogTitle' in runRequest
              ? runRequest.dialogTitle
              : getInstructionTitle(runRequest?.instruction)
          }
          footer={
            <Flex justify="space-between" padding={2} flex={1}>
              {runDisabled ? (
                <Tooltip
                  content={
                    <Flex padding={2}>
                      <Text>Unable to run instruction. All fields must have a value.</Text>
                    </Flex>
                  }
                  placement="top"
                >
                  <Flex flex={1}>{runButton}</Flex>
                </Tooltip>
              ) : (
                runButton
              )}
            </Flex>
          }
        >
          <Stack padding={4} space={2}>
            {runRequest?.userInputBlocks?.map((block, i) => (
              <UserInput
                key={block._key}
                block={block}
                autoFocus={i === 0}
                inputs={inputs}
                setInputs={setInputs}
              />
            ))}
          </Stack>
        </Dialog>
      ) : null}
      {props.children}
    </RunInstructionContext.Provider>
  )
}

export function UserInput(props: {
  block: UserInputBlock
  inputs: BlockInputs
  setInputs: Dispatch<SetStateAction<BlockInputs>>
  autoFocus?: boolean
}) {
  const {block, autoFocus, setInputs, inputs} = props
  const key = block._key
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const onChange = useCallback(
    (e: FormEvent<HTMLTextAreaElement>) => {
      setInputs((current) => ({
        ...current,
        [key]: (e.currentTarget ?? e.target).value,
      }))
    },
    [key, setInputs],
  )

  const value = useMemo(() => inputs[key], [inputs, key])

  useEffect(() => {
    if (!autoFocus) {
      return
    }
    setTimeout(() => textAreaRef.current?.focus(), 0)
  }, [autoFocus])

  return (
    <Stack padding={2} space={3}>
      <FormFieldHeaderText
        title={block?.message ?? 'Provide more context'}
        description={block.description}
      />
      <TextArea
        ref={textAreaRef}
        rows={4}
        value={value}
        onChange={onChange}
        style={{resize: 'vertical'}}
      />
    </Stack>
  )
}
