import {BlockProps, PatchEvent, useFormCallbacks} from 'sanity'
import {useAssistPresence} from '../presence/useAssistPresence'
import {Box, Flex} from '@sanity/ui'
import {ErrorWrapper} from '../components/SafeValueInput'
import {useCallback} from 'react'
import {AiFieldPresence} from '../presence/AiFieldPresence'

export function AssistFormBlock(props: BlockProps) {
  const presence = useAssistPresence(props.path, true)
  const {onChange} = useFormCallbacks()
  const key = props.value._key
  const localOnChange = useCallback(
    (patchEvent: PatchEvent) => {
      if (!key) {
        return
      }
      onChange(PatchEvent.from(patchEvent).prefixAll({_key: key}))
    },
    [onChange, key]
  )
  const singlePresence = presence[0]
  return (
    <ErrorWrapper onChange={localOnChange}>
      <Flex align="center" justify="space-between">
        <Box flex={1}>{props.renderDefault(props)}</Box>
        {singlePresence && <AiFieldPresence presence={singlePresence} />}
      </Flex>
    </ErrorWrapper>
  )
}
